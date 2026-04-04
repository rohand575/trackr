import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Shared data model

private let appGroupSuite = "group.com.trackr.app"

struct WidgetHabit: Identifiable, Codable {
    let id: String
    let name: String
    let icon: String
    let color: String
    let frequency: String
    let completions: [String]
    let isArchived: Bool
}

// MARK: - Timeline

struct HabitEntry: TimelineEntry {
    let date: Date
    let habits: [WidgetHabit]
}

// MARK: - Provider

struct HabitProvider: TimelineProvider {

    func placeholder(in context: Context) -> HabitEntry {
        HabitEntry(date: Date(), habits: [
            WidgetHabit(id: "preview", name: "Morning Run", icon: "🏃", color: "#6366f1",
                        frequency: "Daily", completions: [], isArchived: false),
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (HabitEntry) -> Void) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HabitEntry>) -> Void) {
        let entry = loadEntry()
        // Refresh at the next midnight so "today" is always correct
        let midnight = Calendar.current.startOfDay(for: Date().addingTimeInterval(86400))
        let timeline = Timeline(entries: [entry], policy: .after(midnight))
        completion(timeline)
    }

    private func loadEntry() -> HabitEntry {
        guard
            let defaults = UserDefaults(suiteName: appGroupSuite),
            let jsonStr  = defaults.string(forKey: "habitsJson"),
            let data     = jsonStr.data(using: .utf8),
            let all      = try? JSONDecoder().decode([WidgetHabit].self, from: data)
        else {
            return HabitEntry(date: Date(), habits: [])
        }
        return HabitEntry(date: Date(), habits: all.filter { !$0.isArchived && isDueToday($0.frequency) })
    }

    private func isDueToday(_ frequency: String) -> Bool {
        let weekday = Calendar.current.component(.weekday, from: Date())
        switch frequency {
        case "Weekdays": return weekday >= 2 && weekday <= 6
        case "Weekends": return weekday == 1 || weekday == 7
        default: return true  // Daily, Weekly
        }
    }
}

// MARK: - AppIntent (iOS 17+ interactive Done button)

@available(iOS 17.0, *)
struct MarkHabitCompleteIntent: AppIntent {
    static var title: LocalizedStringResource = "Mark Habit Complete"
    static var description = IntentDescription("Marks a habit as done for today")

    @Parameter(title: "Habit ID")
    var habitId: String

    @Parameter(title: "Date")
    var dateStr: String

    func perform() async throws -> some IntentResult {
        guard
            let defaults     = UserDefaults(suiteName: appGroupSuite),
            let userId       = defaults.string(forKey: "userId"),
            let apiKey       = defaults.string(forKey: "apiKey"),
            let projectId    = defaults.string(forKey: "projectId")
        else { return .result() }

        let idToken = try await getValidToken(defaults: defaults, apiKey: apiKey)
        guard let token = idToken else { return .result() }

        await callFirestoreRest(idToken: token, projectId: projectId, userId: userId,
                                habitId: habitId, dateStr: dateStr)
        updateLocalCompletions(defaults: defaults, habitId: habitId, dateStr: dateStr)
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }

    private func getValidToken(defaults: UserDefaults, apiKey: String) async throws -> String? {
        let now    = Date().timeIntervalSince1970
        let expiry = defaults.double(forKey: "tokenExpiry")
        if expiry - now > 300, let token = defaults.string(forKey: "idToken") {
            return token
        }
        return await refreshIdToken(defaults: defaults, apiKey: apiKey)
    }

    private func refreshIdToken(defaults: UserDefaults, apiKey: String) async -> String? {
        guard let refreshToken = defaults.string(forKey: "refreshToken") else { return nil }
        let urlStr = "https://securetoken.googleapis.com/v1/token?key=\(apiKey)"
        guard let url = URL(string: urlStr) else { return nil }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        req.httpBody = "grant_type=refresh_token&refresh_token=\(refreshToken)".data(using: .utf8)

        guard
            let (data, _) = try? await URLSession.shared.data(for: req),
            let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let newToken = json["id_token"] as? String
        else { return nil }

        let newRefresh = json["refresh_token"] as? String ?? refreshToken
        let expiresIn  = (json["expires_in"] as? TimeInterval) ?? 3600
        defaults.set(newToken,                                  forKey: "idToken")
        defaults.set(newRefresh,                                forKey: "refreshToken")
        defaults.set(Date().timeIntervalSince1970 + expiresIn,  forKey: "tokenExpiry")
        defaults.synchronize()
        return newToken
    }

    @discardableResult
    private func callFirestoreRest(
        idToken: String, projectId: String, userId: String,
        habitId: String, dateStr: String
    ) async -> Bool {
        let docPath = "projects/\(projectId)/databases/(default)/documents/users/\(userId)/habits/\(habitId)"
        let urlStr  = "https://firestore.googleapis.com/v1/projects/\(projectId)/databases/(default)/documents:commit"
        guard let url = URL(string: urlStr) else { return false }

        let payload: [String: Any] = [
            "writes": [[
                "transform": [
                    "document": docPath,
                    "fieldTransforms": [[
                        "fieldPath": "completions",
                        "appendMissingElements": [
                            "values": [["stringValue": dateStr]]
                        ]
                    ]]
                ]
            ]]
        ]
        guard let body = try? JSONSerialization.data(withJSONObject: payload) else { return false }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("Bearer \(idToken)", forHTTPHeaderField: "Authorization")
        req.setValue("application/json",  forHTTPHeaderField: "Content-Type")
        req.httpBody = body

        guard let (_, response) = try? await URLSession.shared.data(for: req),
              let http = response as? HTTPURLResponse else { return false }
        return http.statusCode == 200
    }

    private func updateLocalCompletions(defaults: UserDefaults, habitId: String, dateStr: String) {
        guard
            let jsonStr = defaults.string(forKey: "habitsJson"),
            let data    = jsonStr.data(using: .utf8),
            var habits  = try? JSONDecoder().decode([WidgetHabit].self, from: data)
        else { return }

        habits = habits.map { h in
            guard h.id == habitId, !h.completions.contains(dateStr) else { return h }
            return WidgetHabit(id: h.id, name: h.name, icon: h.icon, color: h.color,
                               frequency: h.frequency,
                               completions: h.completions + [dateStr],
                               isArchived: h.isArchived)
        }
        if let updated = try? JSONEncoder().encode(habits),
           let str     = String(data: updated, encoding: .utf8) {
            defaults.set(str, forKey: "habitsJson")
            defaults.synchronize()
        }
    }
}

// MARK: - Views

struct HabitWidgetEntryView: View {
    var entry: HabitProvider.Entry
    @Environment(\.widgetFamily) var family

    private var today: String {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        return fmt.string(from: Date())
    }

    private var maxHabits: Int { family == .systemSmall ? 3 : 5 }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                Text("Habits")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color(hex: "#6366f1"))
                Spacer()
                let done = entry.habits.filter { $0.completions.contains(today) }.count
                Text("\(done)/\(entry.habits.count)")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
            }

            if entry.habits.isEmpty {
                Text("No habits today.\nOpen Trackr to add some!")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                    .padding(.top, 4)
            } else {
                ForEach(entry.habits.prefix(maxHabits)) { habit in
                    HabitRowView(habit: habit, today: today)
                }
            }

            Spacer()
        }
        .padding(12)
        .containerBackground(.white, for: .widget)
    }
}

struct HabitRowView: View {
    let habit: WidgetHabit
    let today: String
    var done: Bool { habit.completions.contains(today) }

    var body: some View {
        HStack(spacing: 6) {
            Text(habit.icon.isEmpty ? "📋" : habit.icon)
                .font(.system(size: 15))
                .frame(width: 22)

            Text(habit.name)
                .font(.system(size: 13))
                .foregroundColor(done ? .secondary : .primary)
                .strikethrough(done)
                .lineLimit(1)

            Spacer()

            if done {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                    .font(.system(size: 15))
            } else if #available(iOS 17.0, *) {
                // Interactive Done button (iOS 17+)
                Button(intent: MarkHabitCompleteIntent(habitId: habit.id, dateStr: today)) {
                    Image(systemName: "circle")
                        .foregroundColor(Color(hex: habit.color))
                        .font(.system(size: 18))
                }
                .buttonStyle(.plain)
            } else {
                // iOS 15-16: tapping the widget opens the app
                Image(systemName: "circle")
                    .foregroundColor(Color(hex: habit.color))
                    .font(.system(size: 18))
            }
        }
    }
}

// MARK: - Widget declaration

struct HabitWidget: Widget {
    let kind: String = "HabitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HabitProvider()) { entry in
            HabitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Trackr Habits")
        .description("Today's habits at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Helpers

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255.0
        let g = Double((int >> 8)  & 0xFF) / 255.0
        let b = Double(int         & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}

extension MarkHabitCompleteIntent {
    init(habitId: String, dateStr: String) {
        self.habitId = habitId
        self.dateStr = dateStr
    }
}
