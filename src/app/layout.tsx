import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "硬件检测工具",
  description: "全面检测您的设备性能，确保最佳使用体验",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">⚡ 硬件检测</span>
              </a>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  首页
                </a>
                <a href="/mouse-click" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  鼠标点击计数
                </a>
                <a href="/mouse-double-click" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  鼠标双击测试
                </a>
                <a href="/mouse-move" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  鼠标滑动检测
                </a>
                <a href="/keyboard" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  键盘连击检测
                </a>
                <a href="/audio" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  耳机检测
                </a>
                <a href="/microphone" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  麦克风检测
                </a>
                <a href="/display" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  屏幕检测
                </a>
              </nav>
            </div>
          </div>
        </header>
        {children}
        <footer className="mt-auto py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} 硬件检测工具 | 版权所有</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
