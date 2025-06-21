'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";

export default function Home() {
  const hardwareChecks = [
    { name: "鼠标点击计数", path: "/mouse-click", icon: "🖱️", description: "检测鼠标点击速度和每秒点击次数(CPS)" },
    { name: "鼠标双击测试", path: "/mouse-double-click", icon: "🖱️", description: "测试鼠标左右键双击功能和响应间隔" },
    { name: "鼠标滑动检测", path: "/mouse-move", icon: "🖱️", description: "检测鼠标移动平滑度和精确度" },
    { name: "键盘计数测试", path: "/keyboard", icon: "⌨️", description: "检测键盘按键速度和每秒按键次数(KPS)" },
    { name: "键盘双击测试", path: "/keyboard-double", icon: "⌨️", description: "测试键盘是否可以双击，检测重复输入问题" },
    { name: "耳机声音检测", path: "/audio", icon: "🎧", description: "检测耳机音质和平衡性" },
    { name: "麦克风检测", path: "/microphone", icon: "🎤", description: "检测麦克风音质和灵敏度" },
    { name: "屏幕检测", path: "/display", icon: "🖥️", description: "检测屏幕亮度、色彩和刷新率" },
  ];
  
  // ========= 鼠标点击计数测试功能 =========
  const [clicks, setClicks] = useState<number>(0);
  const [cps, setCps] = useState<number>(0);
  const [maxCps, setMaxCps] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  
  const startTimeRef = useRef<number>(0);
  const clickTimesRef = useRef<number[]>([]);
  const cpsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // CPS计时器
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // 测试结束
            if (interval) clearInterval(interval);
            setIsActive(false);
            
            // 计算最终CPS
            const finalCps = clicks / 10;
            setCps(Math.round(finalCps * 10) / 10);
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, clicks]);
  
  // 使用滑动窗口计算实时CPS
  useEffect(() => {
    if (isActive) {
      // 初始化开始时间
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        clickTimesRef.current = [];
      }
      
      // 创建一个计算CPS的定时器
      cpsIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = (now - startTimeRef.current) / 1000;
        
        // 只保留最近1秒内的点击
        clickTimesRef.current = clickTimesRef.current.filter(time => now - time <= 1000);
        
        // 计算当前的每秒点击数（基于最近1秒的滑动窗口）
        const currentWindowCps = clickTimesRef.current.length;
        
        // 计算整体平均CPS
        const overallCps = elapsedSeconds > 0 ? clicks / elapsedSeconds : 0;
        
        // 取滑动窗口和整体平均中较合理的值
        const calculatedCps = Math.max(
          Math.min(currentWindowCps, clicks), // 防止由于滑动窗口导致的CPS过高
          elapsedSeconds >= 1 ? overallCps : 0 // 至少经过1秒后才考虑整体平均
        );
        
        // 更新CPS，保留一位小数
        const roundedCps = Math.round(calculatedCps * 10) / 10;
        setCps(roundedCps);
        
        // 更新最高CPS
        if (roundedCps > maxCps) {
          setMaxCps(roundedCps);
        }
      }, 100);
    } else {
      // 停止CPS计算
      if (cpsIntervalRef.current) {
        clearInterval(cpsIntervalRef.current);
        cpsIntervalRef.current = null;
      }
      
      // 重置开始时间
      if (!isActive && timeLeft === 10) {
        startTimeRef.current = 0;
        clickTimesRef.current = [];
      }
    }
    
    return () => {
      if (cpsIntervalRef.current) {
        clearInterval(cpsIntervalRef.current);
      }
    };
  }, [isActive, clicks, maxCps, timeLeft]);
  
  // 点击处理函数
  const handleClick = () => {
    if (!isActive && timeLeft === 10) {
      // 开始测试
      setIsActive(true);
      setClicks(1);
      setCps(0);
      setMaxCps(0);
      startTimeRef.current = Date.now();
      clickTimesRef.current = [Date.now()];
    } else if (isActive) {
      // 记录点击时间和增加计数
      clickTimesRef.current.push(Date.now());
      setClicks(clicks + 1);
    }
  };
  
  // 重置函数
  const resetClickTest = () => {
    setIsActive(false);
    setClicks(0);
    setCps(0);
    setMaxCps(0);
    setTimeLeft(10);
    startTimeRef.current = 0;
    clickTimesRef.current = [];
  };
  
  // ========= 鼠标双击测试功能 =========
  const [leftClicks, setLeftClicks] = useState<number>(0);
  const [rightClicks, setRightClicks] = useState<number>(0);
  const [leftDoubleClicks, setLeftDoubleClicks] = useState<number>(0);
  const [rightDoubleClicks, setRightDoubleClicks] = useState<number>(0);
  
  // 时间间隔设置（单位：毫秒）- 默认为80毫秒
  const [doubleClickInterval, setDoubleClickInterval] = useState<number>(80);
  
  // 双击检测
  const lastLeftClickRef = useRef<number>(0);
  const lastRightClickRef = useRef<number>(0);
  
  // 左右键点击处理
  const handleLeftClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLeftClicks(leftClicks + 1);
    
    // 检测双击
    const now = Date.now();
    if (now - lastLeftClickRef.current <= doubleClickInterval) {
      setLeftDoubleClicks(leftDoubleClicks + 1);
    }
    lastLeftClickRef.current = now;
  };
  
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setRightClicks(rightClicks + 1);
    
    // 检测双击
    const now = Date.now();
    if (now - lastRightClickRef.current <= doubleClickInterval) {
      setRightDoubleClicks(rightDoubleClicks + 1);
    }
    lastRightClickRef.current = now;
  };
  
  // 重置测试
  const resetDoubleClickTest = () => {
    setLeftClicks(0);
    setRightClicks(0);
    setLeftDoubleClicks(0);
    setRightDoubleClicks(0);
    lastLeftClickRef.current = 0;
    lastRightClickRef.current = 0;
  };

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

        {/* 硬件检测工具卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
        
        {/* 测试模块区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* 鼠标点击计数测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">鼠标点击计数测试</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">点击次数</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{clicks}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">每秒点击</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{cps}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">最高CPS</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{maxCps}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">剩余时间</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{timeLeft}s</div>
                </div>
              </div>
              
              <button
                onClick={handleClick}
                disabled={timeLeft === 0}
                className={`w-full py-6 mb-4 text-xl font-bold rounded-lg transition-all ${
                  isActive 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : timeLeft === 0 
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {!isActive && timeLeft === 10 ? '点击开始测试' : isActive ? '快速点击此处！' : '测试完成'}
              </button>
              
              {timeLeft === 0 && (
                <button
                  onClick={resetClickTest}
                  className="w-full py-3 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
                >
                  重新测试
                </button>
              )}
            </div>
          </div>
          
          {/* 鼠标双击测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">鼠标双击测试</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">左键点击</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{leftClicks}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">左键双击</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{leftDoubleClicks}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">右键点击</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{rightClicks}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">右键双击</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{rightDoubleClicks}</div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">双击时间间隔 (毫秒)</label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{doubleClickInterval} ms</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  step="10" 
                  value={doubleClickInterval} 
                  onChange={(e) => setDoubleClickInterval(parseInt(e.target.value))} 
                  className="w-full h-2 bg-green-500 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>50ms</span>
                  <span>500ms</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div 
                  className="bg-red-500 hover:bg-red-400 rounded-lg h-32 flex items-center justify-center cursor-pointer transition-colors duration-200"
                  onClick={handleLeftClick}
                  onContextMenu={handleRightClick}
                >
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
                    </div>
                  </div>
                  <p className="absolute text-white font-medium">左键测试区域</p>
                </div>
                
                <div 
                  className="bg-red-500 hover:bg-red-400 rounded-lg h-32 flex items-center justify-center cursor-pointer transition-colors duration-200"
                  onClick={handleLeftClick}
                  onContextMenu={handleRightClick}
                >
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
                    </div>
                  </div>
                  <p className="absolute text-white font-medium">右键测试区域</p>
                </div>
              </div>
              
              <button
                onClick={resetDoubleClickTest}
                className="w-full py-3 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
              >
                重置测试
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            专业硬件检测工具 | 随时随地检测设备性能
          </p>
        </div>
      </main>
    </div>
  );
}
