package com.trackr.app

import android.content.Context
import android.content.Intent
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

const val ACTION_MARK_COMPLETE = "com.trackr.app.MARK_HABIT_COMPLETE"
const val EXTRA_HABIT_ID = "habitId"
const val EXTRA_DATE_STR = "dateStr"

class HabitWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = HabitGlanceWidget()

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_MARK_COMPLETE) {
            val habitId = intent.getStringExtra(EXTRA_HABIT_ID) ?: return
            val dateStr = intent.getStringExtra(EXTRA_DATE_STR) ?: return
            MarkHabitCompleteWorker.enqueue(context, habitId, dateStr)
        }
    }
}
