import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1419" },
  ],
};

export const metadata: Metadata = {
  title: "WeTruck Transporter",
  description: "Transporter Portal for WeTruck Fleet Management",
  ...(siteUrl && { metadataBase: new URL(siteUrl) }),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "WeTruck Transporter",
    description: "Transporter Portal for WeTruck Fleet Management",
    type: "website",
    ...(siteUrl && { url: siteUrl }),
    images: [{ url: "/favicon.ico", width: 32, height: 32, alt: "WeTruck" }],
  },
  twitter: {
    card: "summary",
    title: "WeTruck Transporter",
    description: "Transporter Portal for WeTruck Fleet Management",
  },
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="overflow-x-hidden touch-manipulation"
    >
      <body
        className={`${openSans.className} antialiased overflow-x-hidden min-h-screen touch-manipulation`}
      >
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
