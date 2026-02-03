import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { Toaster } from "sonner";
import MobileContainer from "@/components/MobileContainer";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import OfflineBanner from "@/components/OfflineBanner";
import PWAProvider from "@/components/PWAProvider";
import { PushNotificationManager } from "@/components/PushNotificationManager";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "KonuşKoç - Konuşma ve Okuma Koçunuz",
  description: "Konuşma akıcılığı, diksiyon, hızlı okuma ve daha fazlası için kişisel koçunuz",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KonuşKoç",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} bg-slate-950`}>
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <PWAProvider>
              <PushNotificationManager />
              <MobileContainer>
                {children}
              </MobileContainer>
              <OfflineBanner />
              <Toaster
                position="top-center"
                richColors
                closeButton
              />
            </PWAProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
