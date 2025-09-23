// src/app/layout.tsx (GÜNCELLENMİŞ HALİ)

import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWAInitializer } from "@/components/pwa/pwa-initializer";
import CookieBanner from "@/components/legal/cookie-banner";
import { ComplianceBanner } from "@/components/legal/compliance-banner";
import { Toaster } from "sonner";
import "./globals.css";

// 🔥 GÜNCELLEME: Gerekli import'lar eklendi
import { headers } from 'next/headers';
import Script from 'next/script';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f59e0b',
}

export const metadata: Metadata = {
  title: "EnerjiOS | Güneş Enerjisi Yönetim Platformu",
  description: "Türkiye'nin en kapsamlı güneş enerjisi sistemi (GES) satış ve yönetim platformu. Çiftçiler, ev sahipleri ve işletmeler için özel çözümler.",
  keywords: "güneş enerjisi, GES, solar panel, çiftçi, tarımsal ges, çatı ges, enerji yönetimi",
  manifest: "/manifest.json",
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
  // 🔥 GÜNCELLEME: Middleware'in oluşturduğu nonce'u başlıklardan oku.
  const nonce = headers().get('x-nonce') || '';

  return (
    <html lang="tr">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            {children}
            <ComplianceBanner />
            <Toaster position="top-right" />
            <PWAInitializer />
            <CookieBanner />
          </AuthProvider>
        </ThemeProvider>
        
        {/* 🔥 GÜNCELLEME: Google'ın istemci betiği, doğru nonce değeriyle buraya eklendi. */}
        <Script
          src="https://accounts.google.com/gsi/client"
          async
          defer
          nonce={nonce} 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}