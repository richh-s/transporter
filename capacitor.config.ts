import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "transporter",
  webDir: "out",
  // Use HTTPS scheme so the app origin is https://localhost (helps with CORS when API allows that origin).
  server: {
    androidScheme: "https",
  },
  // If you need to call a local HTTP backend (e.g. http://192.168.x.x:8000), temporarily set:
  // server: { androidScheme: "http", cleartext: true }, and in AndroidManifest.xml set android:usesCleartextTraffic="true".
};

export default config;
