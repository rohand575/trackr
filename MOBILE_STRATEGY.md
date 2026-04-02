# Trackr Mobile Strategy

## Overview

Trackr will be extended to Android and iOS using **Capacitor** — the same existing React/Tailwind/Firebase codebase runs inside a native app shell. No rewrites. No new framework to learn.

**The update workflow will be:**
```
edit web code → npm run build → npx cap sync → changes live on all platforms
```

---

## Why Capacitor?

| Approach | Code Sharing | Same Look & Feel | Effort |
|---|---|---|---|
| **Capacitor** ✅ | 100% — zero UI rewrites | Identical (same HTML/CSS) | Low |
| React Native | ~50% (logic only, UI rewrite) | Different (native primitives) | Very High |
| Flutter | 0% (full Dart rewrite) | Different | Extreme |
| PWA only | 100% | Identical | Very Low (but no App Store) |

Capacitor wraps the existing web app in a native WebView. Every Tailwind style, every Firebase call, every Zustand store works exactly as-is. Publishing to the App Store and Google Play is the only new piece.

---

## Phase 0: PWA Foundation
**Effort: 1–2 days**

Make the web app installable directly from a browser before packaging it natively.

### What to do
- [x] Install `vite-plugin-pwa`
- [x] Add `manifest.json` (app name, icons, theme color `#6366f1`, background color)
- [x] Configure service worker for offline caching of the app shell
- [x] Generate app icons at required sizes (512×512, 192×192, etc.)

### Deliverable
- Chrome on Android shows "Add to Home Screen" prompt
- App works offline (shows cached UI; real-time Firebase syncs when online)
- Safari on iOS allows "Add to Home Screen" install

### Commands
```bash
npm install vite-plugin-pwa --save-dev
```

---

## Phase 1: Capacitor → Android App
**Effort: 3–5 days**

Package the web app as a native Android APK.

### What to do
- [x] Install Capacitor core packages
- [x] Initialize Capacitor with app ID and name
- [x] Add the Android platform
- [x] Build web app and sync to native
- [ ] Test on Android emulator (Android Studio required)
- [x] Test on a physical Android device

### Commands
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

npx cap init "Trackr" "com.trackr.app" --web-dir dist

npm run build
npx cap add android
npx cap sync

# Open in Android Studio to run emulator
npx cap open android
```

### Convenience scripts (added to package.json)
```bash
npm run cap:sync          # build + sync in one step
npm run cap:open:android  # open in Android Studio
npm run cap:run:android   # build & run on connected device/emulator
```

### After every web change
```bash
npm run cap:sync
```

### Deliverable
- Working Android APK installable on any Android device

### Notes
- **App ID:** `com.trackr.app` — set in `capacitor.config.ts`. Change this before publishing if you want a different package name.
- **`--legacy-peer-deps` required:** `vite-plugin-pwa@1.2.0` doesn't declare support for Vite 8 in its peer deps. All `npm install` commands need `--legacy-peer-deps` until the plugin updates. This doesn't cause runtime issues.
- **Android Studio required** to run the emulator or build a signed APK. Install it from https://developer.android.com/studio.
- **`android/` folder** is generated and should be committed to git — it contains native project config that may be manually edited (splash screens, permissions, etc.).
- **`server.androidScheme: 'https'`** is set in `capacitor.config.ts` so that cookies, service workers, and other web APIs that require a secure context work correctly inside the Android WebView.

---

## Phase 2: iOS Platform Setup
**Effort: ~1–2 days setup, then test and iterate**

> ⚠️ **iOS builds require a Mac with Xcode.** On Windows, use GitHub Actions (macOS runner) for CI builds. The project files (`ios/`) can be set up on Windows; building and deploying to device requires macOS.

### What was done (completed on Windows)
- [x] Install `@capacitor/ios` (already in package.json)
- [x] Add iOS platform (`npx cap add ios`) — creates `ios/` Xcode project folder
- [x] Install `@capacitor/assets` and generate all icon sizes
- [x] Add iOS convenience scripts to `package.json`

### Commands
```bash
# Already done — for reference:
npm install @capacitor/assets --save-dev --legacy-peer-deps
npx cap add ios
npx capacitor-assets generate   # or: npm run cap:assets

# Open in Xcode (run on a Mac):
npm run cap:open:ios    # npx cap open ios
npm run cap:run:ios     # build & run on connected device/simulator
```

### Icon source files
Icons and splash screens are generated from `assets/` folder:
- `assets/icon-only.png` — square app icon (512×512, ideally 1024×1024)
- `assets/icon-foreground.png` — adaptive icon foreground (Android)

> **Note:** Current source icons are 512×512 (from PWA build). Replace with 1024×1024 sources for best quality — especially for the App Store, which requires a 1024×1024 marketing icon. Re-run `npm run cap:assets` after swapping.

### After every web change
```bash
npm run cap:sync   # builds web app + syncs to ios/ and android/
```

---

## Phase 2a: Free iPhone Installation (No Developer Account)
**Goal: Test on a real iPhone before committing to $99/year**

> There is no way to install a custom iOS app on an iPhone through the App Store without an Apple Developer account. However, there are two **free** options using a plain Apple ID.

---

### Method 1: Xcode Free Provisioning ✅ Simplest (Mac required)

This is the easiest method. Xcode can sign and deploy the app to your iPhone using any free Apple ID — no developer account needed.

**Limitations:**
- App certificate expires every **7 days**. After 7 days, open Xcode and rebuild to re-deploy.
- Max 3 apps per device on a free Apple ID.
- Some Xcode capabilities (push notifications, in-app purchases) require a paid account — not relevant for Trackr.

**Steps:**

1. On a Mac: clone the repo and run `npm run cap:sync` to get the latest build into `ios/`
2. Open Xcode: `npm run cap:open:ios` (or open `ios/App/App.xcworkspace` directly)
3. Connect your iPhone via USB cable
4. In Xcode: select your iPhone as the build target (top bar, next to ▶ button)
5. Go to **Xcode → Settings → Accounts** → add your Apple ID (the free one, same as iCloud)
6. In the project navigator, click **App** (the top-level project) → **Signing & Capabilities**
7. Under **Team**, select your personal Apple ID
8. Xcode will auto-generate a free development certificate and provisioning profile
9. Click **▶ Run** — Xcode builds and installs the app on your iPhone
10. On iPhone: **Settings → General → VPN & Device Management → [your Apple ID] → Trust**
11. Done — open Trackr from your home screen

**Re-deploying after 7 days:**
- Just connect iPhone, open Xcode, click Run again. Takes ~1 minute.

---

### Method 2: GitHub Actions + AltStore (Windows-friendly, more complex)

Use this if you don't have access to a Mac. It involves building the IPA in CI and sideloading it onto the iPhone.

**How it works:**
- GitHub Actions has free macOS runners (2000 min/month on free tier) — enough to build the IPA
- AltStore is an app that installs on iPhone and re-signs apps using your Apple ID, refreshing every 7 days automatically

**Limitations:**
- Same 7-day expiry as Method 1 (free Apple ID limit)
- Requires AltServer running on your Windows PC with iTunes installed to auto-refresh
- Initial setup is more involved than Method 1

**Steps:**

1. **Install AltServer on Windows:**
   - Download AltServer from altstore.io
   - Install iTunes from Apple's website (the non-Microsoft-Store version — important)
   - Run AltServer in the system tray

2. **Install AltStore on iPhone:**
   - Connect iPhone via USB
   - Click the AltServer tray icon → Install AltStore → select your iPhone
   - Enter your Apple ID when prompted
   - On iPhone: **Settings → General → VPN & Device Management → Trust** your Apple ID

3. **Build the IPA via GitHub Actions:**
   - The workflow is already created at `.github/workflows/ios-build.yml`
   - It builds an **unsigned IPA** on a macOS runner — AltStore re-signs it with your Apple ID on install
   - **Trigger the build:**
     - Go to your repo on GitHub → **Actions** tab
     - Click **"Build iOS IPA"** in the left sidebar
     - Click **"Run workflow"** → **"Run workflow"** (green button)
     - Wait ~10–15 minutes for the macOS build to complete

4. **Download the IPA:**
   - After the workflow run turns green (✅), click into that run
   - Scroll to the bottom of the run page → **Artifacts** section
   - Click **"Trackr-iOS"** — downloads a zip file
   - Unzip it → you'll find `Trackr.ipa` inside
   - Artifacts are kept for **30 days** before auto-deletion

5. **Sideload the IPA:**
   - Open AltStore on iPhone → **My Apps** tab → **+** button (top left)
   - Select the `Trackr.ipa` file
   - AltStore re-signs it with your Apple ID and installs it
   - Takes ~30 seconds

6. **Auto-refresh:**
   - AltStore refreshes installed apps every 7 days when AltServer is running and iPhone is on the same Wi-Fi
   - Or open AltStore → My Apps → long-press Trackr → Refresh

> **Recommendation:** Use Method 1 (Xcode) if you have any access to a Mac — even borrowing one for 10 minutes is enough to do the initial install. Method 2 is the Windows fallback.

---

## Phase 3: App Store + Play Store Submission *(Future — skip until satisfied with iPhone testing)*

> ⏳ **Deferred** — complete iPhone testing with free provisioning first, then decide whether to pay for Apple Developer account.

### When you're ready
- [ ] Create Apple Developer account — $99/year at developer.apple.com
- [ ] Create Google Play Developer account — $25 one-time at play.google.com/console
- [ ] Configure iOS provisioning profiles and signing certificates (Xcode → Signing & Capabilities, set to Distribution)
- [ ] Configure Android signing keystore (Android Studio → Build → Generate Signed APK)
- [ ] Submit to Google Play (review: 1–3 days)
- [ ] Submit to Apple App Store (review: 1–7 days)

### What changes for App Store builds vs. free provisioning
- Signing profile changes from **Development** to **Distribution** in Xcode
- Bundle ID (`com.trackr.app`) must be registered in App Store Connect
- Need to provide 1024×1024 app icon, screenshots, and store description
- No 7-day expiry — App Store apps don't expire

### Notes
- The `ios/` project and all `npm run cap:*` scripts are already set up — nothing needs to change in the codebase to go from free testing to App Store submission. It's just a signing configuration change in Xcode.
- Keep `com.trackr.app` as the App ID — it's already set in `capacitor.config.ts`. Register this exact bundle ID in App Store Connect when the time comes.

---

## Phase 4: Native Enhancements
**Effort: Ongoing (add as needed)**

Optional native features that go beyond what the web can do.

### Push Notifications
```bash
npm install @capacitor/push-notifications
```
- Use Firebase Cloud Messaging (FCM) for cross-platform delivery
- Send reminders for upcoming subscription renewals

### Biometric Authentication
```bash
npm install @capacitor/biometrics
```
- Face ID / Touch ID / fingerprint unlock

### Haptic Feedback
```bash
npm install @capacitor/haptics
```
- Tactile confirmation on subscription add/delete

### Deep Linking
- Open the app from email links (e.g. `trackr://dashboard`)

---

## Keeping All Platforms in Sync

After any code change to the web app:

```bash
npm run build        # Rebuild the web app (dist/)
npx cap sync         # Push built files to android/ and ios/ native projects
```

Or use the convenience script:
```bash
npm run cap:sync     # does both in one step
```

That's it. The native apps always wrap the latest web build. You do **not** need to resubmit to the App Store for web-only changes if you use Capacitor's live update option (Capacitor Live Updates / Appflow — optional paid service). For most updates, a normal App Store release is the standard path.

---

## Directory Structure After Setup

```
trackr/
├── src/                  # Web app source (React)
├── dist/                 # Built web app (Capacitor reads this)
├── assets/               # Source icons for @capacitor/assets (commit this)
│   ├── icon-only.png     # 512×512 (replace with 1024×1024 for best quality)
│   └── icon-foreground.png  # Adaptive icon foreground (Android)
├── android/              # Android Studio project (commit this)
├── ios/                  # Xcode project (commit this, build on Mac)
├── capacitor.config.ts   # Capacitor configuration
├── MOBILE_STRATEGY.md    # This file
└── ...
```

> Commit `android/`, `ios/`, and `assets/` directories to git.

---

## Accounts & Costs

| Item | Cost | Notes |
|---|---|---|
| Free Apple ID | Free | Works for device testing via Xcode (7-day expiry) |
| Apple Developer Account | $99/year | Required for App Store — defer until ready |
| Google Play Developer | $25 one-time | Required for Play Store — defer until ready |
| Capacitor (open source) | Free | Apache 2.0 license |
| GitHub Actions macOS runner | Free (2000 min/month) | For iOS CI builds on Windows |
| AltStore | Free | Sideloading tool for Windows-based iPhone testing |

---

## Effort Summary

| Phase | What | Effort |
|---|---|---|
| 0 | PWA — browser installable, offline support | ✅ Done |
| 1 | Capacitor → Android APK | ✅ Done |
| 2 | iOS platform setup + icons | ✅ Done |
| 2a | Free iPhone testing (Xcode or AltStore) | Ready — needs Mac/AltStore setup |
| 3 | App Store + Play Store submission | Future — after iPhone testing |
| 4 | Push notifications, biometrics, haptics | Ongoing |
