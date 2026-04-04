import Capacitor
import WidgetKit

@objc(HabitWidgetPlugin)
public class HabitWidgetPlugin: CAPPlugin {

    private let suiteName = "group.com.trackr.app"

    @objc func syncHabits(_ call: CAPPluginCall) {
        guard let habitsJson = call.getString("habitsJson") else {
            call.reject("habitsJson required")
            return
        }

        let userId       = call.getString("userId")       ?? ""
        let idToken      = call.getString("idToken")      ?? ""
        let refreshToken = call.getString("refreshToken") ?? ""
        let apiKey       = call.getString("apiKey")       ?? ""
        let projectId    = call.getString("projectId")    ?? ""
        let tokenExpiry  = call.getDouble("tokenExpiry")  ?? 0.0

        guard let defaults = UserDefaults(suiteName: suiteName) else {
            call.reject("App Group not configured — add 'group.com.trackr.app' in Xcode Signing & Capabilities")
            return
        }

        defaults.set(habitsJson,   forKey: "habitsJson")
        defaults.set(userId,       forKey: "userId")
        defaults.set(idToken,      forKey: "idToken")
        defaults.set(refreshToken, forKey: "refreshToken")
        defaults.set(apiKey,       forKey: "apiKey")
        defaults.set(projectId,    forKey: "projectId")
        defaults.set(tokenExpiry,  forKey: "tokenExpiry")
        defaults.synchronize()

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve()
    }

    @objc func triggerWidgetUpdate(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve()
    }
}
