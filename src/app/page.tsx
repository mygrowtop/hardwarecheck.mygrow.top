import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const hardwareChecks = [
    { name: "鼠标连击检测", path: "/mouse-click", icon: "🖱️", description: "检测鼠标连击速度和稳定性" },
    { name: "鼠标滑动检测", path: "/mouse-move", icon: "🖱️", description: "检测鼠标移动平滑度和精确度" },
    { name: "键盘连击检测", path: "/keyboard", icon: "⌨️", description: "检测键盘按键响应速度" },
    { name: "耳机声音检测", path: "/audio", icon: "🎧", description: "检测耳机音质和平衡性" },
    { name: "麦克风检测", path: "/microphone", icon: "🎤", description: "检测麦克风音质和灵敏度" },
    { name: "屏幕检测", path: "/display", icon: "🖥️", description: "检测屏幕亮度、色彩和刷新率" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            硬件检测工具
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            全面检测您的设备性能，确保最佳使用体验
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hardwareChecks.map((check) => (
            <Link 
              href={check.path} 
              key={check.path}
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 h-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">{check.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {check.name}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {check.description}
                </p>
                <div className="flex justify-end">
                  <span className="text-blue-500 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
                    开始检测 →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            专业硬件检测工具 | 随时随地检测设备性能
          </p>
          <div className="flex justify-center mt-4 space-x-4">
            <a
              href="https://github.com/yourusername/hardware-check"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              GitHub
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              关于我们
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
