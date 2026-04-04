#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(HabitWidgetPlugin, "HabitWidgetPlugin",
    CAP_PLUGIN_METHOD(syncHabits, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(triggerWidgetUpdate, CAPPluginReturnPromise);
)
