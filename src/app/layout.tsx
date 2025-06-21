import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "硬件检测工具 | 全面检测您的设备性能",
  description: "提供鼠标连击、滑动检测，键盘连击检测，耳机声音检测，麦克风检测和屏幕检测等多项功能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} antialiased`}>
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="font-bold text-xl text-gray-900 dark:text-white flex items-center">
                <span className="text-blue-500 mr-2">⚡</span>
                硬件检测
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/mouse-click" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">鼠标连击</Link>
                <Link href="/mouse-move" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">鼠标滑动</Link>
                <Link href="/keyboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">键盘连击</Link>
                <Link href="/audio" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">耳机声音</Link>
                <Link href="/microphone" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">麦克风</Link>
                <Link href="/display" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">屏幕检测</Link>
              </nav>
              <div className="md:hidden">
                {/* 移动端菜单按钮 - 实际实现时可添加下拉菜单 */}
                <button className="text-gray-600 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {children}
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600 dark:text-gray-400 text-center md:text-left">
                  © {new Date().getFullYear()} 硬件检测工具 | 保留所有权利
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="https://github.com/yourusername/hardware-check" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                  GitHub
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                  隐私政策
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                  联系我们
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
