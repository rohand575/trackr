# Trackr Roadmap

## ✅ Shipped (v1)

- **Subscription Tracker** — CRUD, country tabs (Germany/India), search & filter, summary bar, billing cycle/payment method tracking
- **Goals Tracker** — CRUD with progress bars, milestones, status management (Active/Completed/Abandoned), deadline countdown
- **Habits Tracker** — Daily check-in, 7-day visual tracker, streak counter, weekly completion rate, archive/restore
- **Document Vault** — CRUD with expiry status (Valid/Expiring Soon/Expired/No Expiry), category & country filters, urgency indicators
- **Auth** — Email/password registration & login, Firebase Auth, protected routes
- **Sample Data Seeding** — Pre-populate subscriptions on first signup
- **UI/UX** — Tailwind CSS, responsive design, mobile FABs, modals with Zod validation, toast notifications

---

## 🚧 Planned Features

### Dashboard & Analytics
- [ ] Unified home dashboard with at-a-glance widgets (subscriptions total, habits streak, expiring docs, active goals)
- [ ] Monthly/yearly spending charts for subscriptions (bar chart, trend line)
- [ ] Habit heatmap calendar (GitHub-style contribution graph)
- [ ] Goal completion timeline / burndown chart

### Subscriptions
- [ ] Auto-detect duplicate subscriptions
- [ ] Currency conversion with live exchange rates (EUR ↔ INR ↔ USD)
- [ ] Recurring payment reminders / push notifications
- [ ] Subscription sharing — split costs with housemates
- [ ] Import subscriptions from bank statement CSV
- [ ] Category-level budgets with overspend alerts

### Goals & Habits
- [ ] Goal templates (e.g. "Save for emergency fund", "Learn a language")
- [ ] Sub-goals / linked goals
- [ ] Habit reminders via push / email
- [ ] Weekly/monthly habit summary reports
- [ ] Public accountability — share habit streaks with friends
- [ ] Habit "rest days" and streak-freeze feature

### Document Vault
- [ ] File attachment upload (PDF/image) to Firebase Storage or Cloud Storage
- [ ] OCR-based auto-fill from document scan
- [ ] Document sharing with trusted contacts
- [ ] Push/email notifications before document expiry
- [ ] Bulk import from Google Drive / Dropbox
- [ ] Document templates (auto-fill category/issuer for common docs)

### Multi-Country & Localization
- [ ] Add more countries beyond Germany & India
- [ ] Language selector (EN, DE, HI)
- [ ] Country-specific document templates (e.g. Aufenthaltstitel, Aadhaar)
- [ ] Timezone-aware reminders

### User Experience
- [ ] Dark mode toggle
- [ ] Drag-and-drop reorder for habits / goals
- [ ] Keyboard shortcuts for power users
- [ ] Onboarding tour for first-time users
- [ ] PWA support (installable, offline-capable)
- [ ] Customizable dashboard layout (widget grid)

### Data & Export
- [ ] Export to CSV / PDF
- [ ] Backup & restore (JSON export/import)
- [ ] Firestore offline persistence
- [ ] Printable document checklist for travel

### Social & Collaboration
- [ ] Household / family accounts with shared subscriptions & documents
- [ ] Invite partner to shared goals
- [ ] Activity feed / changelog per item

### Security & Infrastructure
- [ ] Two-factor authentication
- [ ] Biometric lock for document vault
- [ ] Audit log for document access
- [ ] Rate limiting on API calls
- [ ] Firestore security rules hardening
- [ ] CI/CD pipeline (GitHub Actions → Firebase Hosting)
- [ ] E2E tests with Playwright
- [ ] Unit tests with Vitest

### Integrations
- [ ] Google Calendar sync for deadlines & expiry dates
- [ ] Slack/Telegram bot for daily habit reminders
- [ ] Zapier / Make.com webhooks
- [ ] Bank API integration for auto-detecting subscriptions (Plaid / finAPI)

---

## 💡 Ideas (Backlog)

- AI-powered subscription recommendations ("Users like you saved €X by switching to...")
- Smart document scanner with field extraction
- Gamification — XP, levels, badges for habit consistency
- Habit "challenges" (30-day challenges with community leaderboard)
- Subscription price history tracker ("Netflix raised prices 3 times since you signed up")
- Voice-controlled quick check-in ("Hey Trackr, mark gym as done")
- Widget for Android/iOS home screen
