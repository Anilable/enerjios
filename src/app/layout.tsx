import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWAInitializer } from "@/components/pwa/pwa-initializer";
import { ChatSupport } from "@/components/chat/chat-support";
import ChatWidget from "@/components/chat/ChatWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EnerjiOS | Güneş Enerjisi Yönetim Platformu",
  description: "Türkiye'nin en kapsamlı güneş enerjisi sistemi (GES) satış ve yönetim platformu. Çiftçiler, ev sahipleri ve işletmeler için özel çözümler.",
  keywords: "güneş enerjisi, GES, solar panel, çiftçi, tarımsal ges, çatı ges, enerji yönetimi",
  manifest: "/manifest.json",
  themeColor: "#f59e0b",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EnerjiOS"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: "EnerjiOS | Güneş Enerjisi Yönetim Platformu",
    description: "Türkiye'nin en kapsamlı güneş enerjisi sistemi satış ve yönetim platformu",
    url: "https://enerjios.com",
    siteName: "EnerjiOS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630
      }
    ],
    locale: "tr_TR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "EnerjiOS",
    description: "Güneş Enerjisi Yönetim Platformu",
    images: ["/twitter-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            {children}
            <PWAInitializer />
            <ChatSupport />
            <ChatWidget />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
