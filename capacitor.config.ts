import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wetruck.transporter", // ← Change this
  appName: "Wetruck Transporter",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
