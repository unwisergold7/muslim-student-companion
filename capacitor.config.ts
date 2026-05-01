import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration.
 *
 * webDir points at the Next.js static export output directory ("out").
 * There is no server.url — the app loads entirely from local bundled files.
 * This is required for App Store submission and offline use.
 */
const config: CapacitorConfig = {
  appId: "com.zaahidm8.muslimstudentcompanion",
  appName: "Muslim Student Companion",
  webDir: "out",
  plugins: {
    Geolocation: {
      // iOS: NSLocationWhenInUseUsageDescription is in Info.plist
      // Android: ACCESS_FINE_LOCATION is in AndroidManifest.xml
    },
    Haptics: {},
  },
};

export default config;
