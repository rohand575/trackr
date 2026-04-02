import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trackr.app',
  appName: 'Trackr',
  webDir: 'dist',
  server: {
    // Required so cookies, service workers, and other secure-context APIs
    // work correctly inside the Android WebView.
    androidScheme: 'https',
  },
  plugins: {
    // Local notifications channel config — applied at build time by cap sync.
    // The channel is also created at runtime in localNotifications.ts.
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#6366f1',
      sound: 'beep.wav',
    },
    // Deep link URL scheme: trackr://dashboard, trackr://bills, etc.
    // After running `npx cap sync`, also register the scheme in the native
    // projects:
    //   Android — android/app/src/main/AndroidManifest.xml (intent-filter)
    //   iOS     — ios/App/App/Info.plist (CFBundleURLTypes)
    // See MOBILE_STRATEGY.md § Phase 4 for the full native config snippets.
  },
};

export default config;
