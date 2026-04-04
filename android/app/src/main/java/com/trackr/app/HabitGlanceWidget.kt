package com.trackr.app

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.action.actionSendBroadcast
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.*
import androidx.glance.unit.ColorProvider
import org.json.JSONArray
import java.time.DayOfWeek
import java.time.LocalDate

data class WidgetHabit(
    val id: String,
    val name: String,
    val icon: String,
    val color: String,
    val frequency: String,
    val completions: List<String>,
)

fun loadHabits(context: Context): List<WidgetHabit> {
    val prefs = context.getSharedPreferences(WIDGET_PREFS_NAME, Context.MODE_PRIVATE)
    val json = prefs.getString("habitsJson", null) ?: return emptyList()
    return try {
        val arr = JSONArray(json)
        (0 until arr.length()).mapNotNull { i ->
            val obj = arr.getJSONObject(i)
            if (obj.optBoolean("isArchived", false)) return@mapNotNull null
            val comps = mutableListOf<String>()
            val compsArr = obj.optJSONArray("completions")
            if (compsArr != null) {
                for (j in 0 until compsArr.length()) comps.add(compsArr.getString(j))
            }
            WidgetHabit(
                id = obj.getString("id"),
                name = obj.getString("name"),
                icon = obj.optString("icon", ""),
                color = obj.optString("color", "#6366f1"),
                frequency = obj.optString("frequency", "Daily"),
                completions = comps,
            )
        }
    } catch (_: Exception) {
        emptyList()
    }
}

fun isDueToday(frequency: String): Boolean {
    val day = LocalDate.now().dayOfWeek
    return when (frequency) {
        "Weekdays" -> day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY
        "Weekends" -> day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY
        else -> true  // Daily, Weekly
    }
}

class HabitGlanceWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val allHabits = loadHabits(context)
        val today = LocalDate.now().toString()
        val todayHabits = allHabits.filter { isDueToday(it.frequency) }
        val completedCount = todayHabits.count { it.completions.contains(today) }

        provideContent {
            GlanceTheme {
                WidgetContent(context, todayHabits, today, completedCount)
            }
        }
    }

    @Composable
    private fun WidgetContent(
        context: Context,
        habits: List<WidgetHabit>,
        today: String,
        completedCount: Int,
    ) {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(Color.White)
                .padding(12.dp),
        ) {
            // Header row
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "Habits",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF6366F1)),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    modifier = GlanceModifier.defaultWeight(),
                )
                Text(
                    text = "$completedCount / ${habits.size}",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF6B7280)),
                        fontSize = 12.sp,
                    ),
                )
            }

            Spacer(GlanceModifier.height(8.dp))

            if (habits.isEmpty()) {
                Text(
                    text = "No habits today",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF9CA3AF)),
                        fontSize = 12.sp,
                    ),
                )
            } else {
                habits.take(5).forEach { habit ->
                    HabitRow(context, habit, habit.completions.contains(today), today)
                    Spacer(GlanceModifier.height(6.dp))
                }
            }

            Spacer(GlanceModifier.defaultWeight())

            // Footer — open app
            Text(
                text = "Open Trackr \u2192",
                style = TextStyle(
                    color = ColorProvider(Color(0xFF6366F1)),
                    fontSize = 11.sp,
                ),
                modifier = GlanceModifier.clickable(
                    actionStartActivity<MainActivity>()
                ),
            )
        }
    }

    @Composable
    private fun HabitRow(
        context: Context,
        habit: WidgetHabit,
        done: Boolean,
        today: String,
    ) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = habit.icon.ifEmpty { "\uD83D\uDCCB" },
                style = TextStyle(fontSize = 15.sp),
                modifier = GlanceModifier.width(24.dp),
            )

            Spacer(GlanceModifier.width(4.dp))

            Text(
                text = habit.name,
                style = TextStyle(
                    color = ColorProvider(if (done) Color(0xFF9CA3AF) else Color(0xFF1F2937)),
                    fontSize = 13.sp,
                ),
                modifier = GlanceModifier.defaultWeight(),
                maxLines = 1,
            )

            if (done) {
                Text(
                    text = "\u2713",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF10B981)),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    modifier = GlanceModifier.width(32.dp),
                )
            } else {
                Box(
                    modifier = GlanceModifier
                        .size(30.dp)
                        .cornerRadius(8.dp)
                        .background(Color(0xFFEEF2FF))
                        .clickable(
                            actionSendBroadcast(
                                Intent(ACTION_MARK_COMPLETE).apply {
                                    setPackage(context.packageName)
                                    putExtra(EXTRA_HABIT_ID, habit.id)
                                    putExtra(EXTRA_DATE_STR, today)
                                }
                            )
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "\u2713",
                        style = TextStyle(
                            color = ColorProvider(Color(0xFF6366F1)),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                    )
                }
            }
        }
    }
}
