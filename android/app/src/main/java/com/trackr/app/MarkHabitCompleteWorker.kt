package com.trackr.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.SharedPreferences
import androidx.glance.appwidget.updateAll
import androidx.work.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class MarkHabitCompleteWorker(
    private val context: Context,
    workerParams: WorkerParameters,
) : CoroutineWorker(context, workerParams) {

    companion object {
        private const val KEY_HABIT_ID = "habitId"
        private const val KEY_DATE_STR = "dateStr"

        fun enqueue(context: Context, habitId: String, dateStr: String) {
            val request = OneTimeWorkRequestBuilder<MarkHabitCompleteWorker>()
                .setInputData(workDataOf(KEY_HABIT_ID to habitId, KEY_DATE_STR to dateStr))
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(context).enqueue(request)
        }
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val habitId = inputData.getString(KEY_HABIT_ID) ?: return@withContext Result.failure()
        val dateStr = inputData.getString(KEY_DATE_STR) ?: return@withContext Result.failure()

        val prefs = context.getSharedPreferences(WIDGET_PREFS_NAME, Context.MODE_PRIVATE)
        val userId    = prefs.getString("userId",    null) ?: return@withContext Result.failure()
        val apiKey    = prefs.getString("apiKey",    null) ?: return@withContext Result.failure()
        val projectId = prefs.getString("projectId", null) ?: return@withContext Result.failure()

        val idToken = getValidToken(prefs, apiKey) ?: return@withContext Result.retry()

        val success = callFirestoreRest(idToken, projectId, userId, habitId, dateStr)
        if (!success) return@withContext Result.retry()

        // Optimistically update local prefs so widget refreshes immediately
        updateLocalCompletions(prefs, habitId, dateStr)

        // Redraw the widget
        HabitGlanceWidget().updateAll(context)

        Result.success()
    }

    private fun getValidToken(prefs: SharedPreferences, apiKey: String): String? {
        val now = System.currentTimeMillis() / 1000
        val expiry = prefs.getLong("tokenExpiry", 0L)
        return if (expiry - now > 300) {
            prefs.getString("idToken", null)
        } else {
            refreshIdToken(prefs, apiKey)
        }
    }

    private fun refreshIdToken(prefs: SharedPreferences, apiKey: String): String? {
        return try {
            val refreshToken = prefs.getString("refreshToken", null) ?: return null
            val body = "grant_type=refresh_token&refresh_token=$refreshToken"
            val client = OkHttpClient()
            val request = Request.Builder()
                .url("https://securetoken.googleapis.com/v1/token?key=$apiKey")
                .post(body.toRequestBody("application/x-www-form-urlencoded".toMediaType()))
                .build()
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) return null
            val json = JSONObject(response.body!!.string())
            val newIdToken      = json.getString("id_token")
            val newRefreshToken = json.optString("refresh_token", refreshToken)
            val expiresIn       = json.optLong("expires_in", 3600L)
            prefs.edit()
                .putString("idToken",      newIdToken)
                .putString("refreshToken", newRefreshToken)
                .putLong("tokenExpiry",    System.currentTimeMillis() / 1000 + expiresIn)
                .apply()
            newIdToken
        } catch (_: Exception) {
            null
        }
    }

    private fun callFirestoreRest(
        idToken: String,
        projectId: String,
        userId: String,
        habitId: String,
        dateStr: String,
    ): Boolean {
        return try {
            val docPath = "projects/$projectId/databases/(default)/documents/users/$userId/habits/$habitId"
            val payload = JSONObject().apply {
                put("writes", JSONArray().apply {
                    put(JSONObject().apply {
                        put("transform", JSONObject().apply {
                            put("document", docPath)
                            put("fieldTransforms", JSONArray().apply {
                                put(JSONObject().apply {
                                    put("fieldPath", "completions")
                                    put("appendMissingElements", JSONObject().apply {
                                        put("values", JSONArray().apply {
                                            put(JSONObject().put("stringValue", dateStr))
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            }
            val url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents:commit"
            val client = OkHttpClient()
            val request = Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer $idToken")
                .addHeader("Content-Type", "application/json")
                .post(payload.toString().toRequestBody("application/json".toMediaType()))
                .build()
            client.newCall(request).execute().isSuccessful
        } catch (_: Exception) {
            false
        }
    }

    private fun updateLocalCompletions(prefs: SharedPreferences, habitId: String, dateStr: String) {
        try {
            val habitsJson = prefs.getString("habitsJson", null) ?: return
            val arr = JSONArray(habitsJson)
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                if (obj.getString("id") == habitId) {
                    val comps = obj.optJSONArray("completions") ?: JSONArray()
                    val already = (0 until comps.length()).any { comps.getString(it) == dateStr }
                    if (!already) comps.put(dateStr)
                    obj.put("completions", comps)
                    break
                }
            }
            prefs.edit().putString("habitsJson", arr.toString()).apply()
        } catch (_: Exception) { }
    }
}
