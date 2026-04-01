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

## Phase 2: iOS + App Store Submission
**Effort: ~1 week (includes store review wait time)**

> ⚠️ **iOS builds require a Mac with Xcode.** On Windows, use GitHub Actions (macOS runner) for CI builds, or defer iOS until a Mac is available.

### What to do
- [ ] Set up Apple Developer account — $99/year (required for App Store)
- [ ] Set up Google Play Developer account — $25 one-time
- [ ] Add iOS platform (`npx cap add ios`)
- [ ] Generate all icon/splash screen sizes with `@capacitor/assets`
- [ ] Configure Android signing keystore (Android Studio)
- [ ] Configure iOS provisioning profiles and certificates (Xcode)
- [ ] Submit to Google Play (review: 1–3 days)
- [ ] Submit to Apple App Store (review: 1–7 days)

### Commands
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate

npx cap add ios
npx cap open ios   # Opens Xcode
```

### Deliverable
- Trackr live on Google Play Store
- Trackr live on Apple App Store

---

## Phase 3: Native Enhancements
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

That's it. The native apps always wrap the latest web build. You do **not** need to resubmit to the App Store for web-only changes if you use Capacitor's live update option (Capacitor Live Updates / Appflow — optional paid service). For most updates, a normal App Store release is the standard path.

---

## Directory Structure After Setup

```
trackr/
├── src/                  # Web app source (React)
├── dist/                 # Built web app (Capacitor reads this)
├── android/              # Android Studio project (commit this)
├── ios/                  # Xcode project (commit this, build on Mac)
├── capacitor.config.ts   # Capacitor configuration
├── MOBILE_STRATEGY.md    # This file
└── ...
```

> Commit `android/` and `ios/` directories to git. They are generated once and updated by `cap sync`.

---

## Accounts & Costs

| Item | Cost | Notes |
|---|---|---|
| Apple Developer Account | $99/year | Required for App Store distribution |
| Google Play Developer | $25 one-time | Required for Play Store |
| Capacitor (open source) | Free | Apache 2.0 license |
| GitHub Actions macOS runner | Free (2000 min/month) | For iOS CI builds on Windows |

---

## Effort Summary

| Phase | What | Effort |
|---|---|---|
| 0 | PWA — browser installable, offline support | 1–2 days |
| 1 | Capacitor → Android APK | 3–5 days |
| 2 | iOS + App Store + Play Store submission | ~1 week |
| 3 | Push notifications, biometrics, haptics | Ongoing |

**Time to get on both stores: ~2–3 weeks total** (dominated by Apple review wait)
