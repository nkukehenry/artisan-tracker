import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AppProvider from "@/components/providers/AppProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import WebSocketProviderWrapper from "@/components/providers/WebSocketProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectEast",
  description: "Mobile tracking dashboard for ProjectEast",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const html = document.documentElement;
                  
                  if (theme === 'dark') {
                    html.classList.add('dark');
                  } else if (theme === 'light') {
                    html.classList.remove('dark');
                  } else {
                    // For 'system' or no theme, check system preference
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      html.classList.add('dark');
                    } else {
                      html.classList.remove('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <ReduxProvider>
          <ThemeProvider>
            <DeviceProvider>
              <WebSocketProviderWrapper>
                <AppProvider>
                  {children}
                </AppProvider>
              </WebSocketProviderWrapper>
            </DeviceProvider>
          </ThemeProvider>
        </ReduxProvider>

      </body>
    </html>
  );
}
