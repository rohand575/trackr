package com.trackr.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

const val WIDGET_PREFS_NAME = "com.trackr.app.widget_prefs"

@CapacitorPlugin(name = "HabitWidgetPlugin")
class HabitWidgetPlugin : Plugin() {

    @PluginMethod
    fun syncHabits(call: PluginCall) {
        val habitsJson   = call.getString("habitsJson")   ?: run { call.reject("habitsJson required"); return }
        val userId       = call.getString("userId")       ?: ""
        val idToken      = call.getString("idToken")      ?: ""
        val refreshToken = call.getString("refreshToken") ?: ""
        val apiKey       = call.getString("apiKey")       ?: ""
        val projectId    = call.getString("projectId")    ?: ""
        val tokenExpiry  = call.getLong("tokenExpiry", 0L) ?: 0L

        val prefs = context.getSharedPreferences(WIDGET_PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString("habitsJson",   habitsJson)
            putString("userId",       userId)
            putString("idToken",      idToken)
            putString("refreshToken", refreshToken)
            putString("apiKey",       apiKey)
            putString("projectId",    projectId)
            putLong("tokenExpiry",    tokenExpiry)
            apply()
        }

        refreshWidgets()
        call.resolve()
    }

    @PluginMethod
    fun triggerWidgetUpdate(call: PluginCall) {
        refreshWidgets()
        call.resolve()
    }

    private fun refreshWidgets() {
        val manager = AppWidgetManager.getInstance(context)
        val ids = manager.getAppWidgetIds(ComponentName(context, HabitWidgetReceiver::class.java))
        if (ids.isNotEmpty()) {
            manager.notifyAppWidgetViewDataChanged(ids, android.R.id.list)
        }
    }
}
