import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Free Online Hardware Testing Tools | Test Mouse, Keyboard, Display & Audio",
  description: "Professional hardware testing tools for mouse clicks, keyboard input, display quality and audio performance. Quickly check your computer hardware to ensure optimal performance.",
  keywords: "hardware testing, mouse click test, keyboard test, display test, audio test, microphone test, hardware testing tools, online hardware test",
  authors: [{ name: "Hardware Testing Tools Team" }],
  openGraph: {
    title: "Professional Online Hardware Testing Tools | Free Device Performance Check",
    description: "All-in-one solution to test mouse, keyboard, display and audio device performance. Use our online tools to check if your hardware is working properly.",
    url: "https://hwcheck.mygrow.top",
    siteName: "Hardware Testing Tools",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content="wqPP3gwO0ZH_hSXwMq53HHJk6J-rnFN2DukruHBFMWA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://hwcheck.mygrow.top/" />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KNH2V68QVH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KNH2V68QVH');
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">⚡ Hardware Testing</span>
              </a>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Home
                </a>
                <a href="/mouse-click" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Mouse Click
                </a>
                <a href="/mouse-double-click" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Mouse Double
                </a>
                <a href="/mouse-move" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Mouse Move
                </a>
                <a href="/keyboard" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Keyboard
                </a>
                <a href="/keyboard-double" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Keyboard Double
                </a>
                <a href="/audio" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Headphone
                </a>
                <a href="/microphone" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Microphone
                </a>
                <a href="/display" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Display
                </a>
              </nav>
            </div>
          </div>
        </header>
        {children}
        <footer className="mt-auto py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Hardware Testing Tools | All Rights Reserved</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
