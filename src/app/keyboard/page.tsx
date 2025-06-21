'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function KeyboardTest() {
  const [keyPresses, setKeyPresses] = useState<{ [key: string]: number }>({});
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [lastKey, setLastKey] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [kps, setKps] = useState<number>(0);
  const [maxKps, setMaxKps] = useState<number>(0);
  const [pressCount, setPressCount] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  
  const inputRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 键盘按键映射，用于显示更友好的按键名称
  const keyDisplayNames: { [key: string]: string } = {
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Control': 'Ctrl',
    'Shift': 'Shift',
    'Alt': 'Alt',
    'Meta': 'Win',
    'Enter': 'Enter',
    'Backspace': '⌫',
    'Tab': 'Tab',
    'CapsLock': 'Caps',
    'Escape': 'Esc',
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      e.preventDefault();
      
      const key = e.key;
      
      if (!activeKeys.includes(key)) {
        setActiveKeys((prev) => [...prev, key]);
        setPressCount((prev) => prev + 1);
        
        // 更新特定按键的点击次数
        setKeyPresses((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + 1,
        }));
        
        setLastKey(key);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      const key = e.key;
      setActiveKeys((prev) => prev.filter((k) => k !== key));
    };
    
    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, activeKeys]);
  
  // 计时器效果
  useEffect(() => {
    if (isActive) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000;
        setTimeElapsed(elapsed);
        
        // 计算每秒按键次数
        if (elapsed > 0) {
          const currentKps = pressCount / elapsed;
          setKps(Math.round(currentKps * 10) / 10); // 保留一位小数
          
          if (currentKps > maxKps) {
            setMaxKps(Math.round(currentKps * 10) / 10);
          }
        }
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, pressCount, maxKps]);
  
  const startTest = () => {
    setIsActive(true);
    setKeyPresses({});
    setActiveKeys([]);
    setLastKey('');
    setKps(0);
    setMaxKps(0);
    setPressCount(0);
    setTimeElapsed(0);
    startTimeRef.current = Date.now();
    
    // 聚焦到输入区域
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const stopTest = () => {
    setIsActive(false);
  };
  
  // 获取按键排名
  const getTopKeys = () => {
    return Object.entries(keyPresses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };
  
  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 获取显示的按键名
  const getKeyDisplay = (key: string) => {
    return keyDisplayNames[key] || key;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">键盘计数测试</h1>
        <p className="text-gray-600 dark:text-gray-300">
          测试键盘按键速度和每秒按键次数(KPS)
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">按键次数</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{pressCount}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">每秒按键数</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{kps}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">最高KPS</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{maxKps}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">测试时间</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(timeElapsed)}</div>
            </div>
          </div>
          
          <div 
            ref={inputRef}
            tabIndex={0}
            className={`w-full h-32 mb-6 flex items-center justify-center text-center rounded-lg outline-none ${
              isActive 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700' 
                : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600'
            }`}
          >
            {isActive ? (
              lastKey ? (
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">上次按键</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{getKeyDisplay(lastKey)}</div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">请按任意键...</p>
              )
            ) : (
              <p className="text-gray-500 dark:text-gray-400">点击"开始测试"后在此区域进行键盘输入</p>
            )}
          </div>
          
          <div className="flex space-x-4 mb-6">
            {!isActive ? (
              <button
                onClick={startTest}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all"
              >
                开始测试
              </button>
            ) : (
              <button
                onClick={stopTest}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all"
              >
                停止测试
              </button>
            )}
          </div>
          
          <div className="mb-6 min-h-[52px]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">当前按下的按键</h3>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {activeKeys.length > 0 ? (
                activeKeys.map((key) => (
                  <span 
                    key={key} 
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg text-sm"
                  >
                    {getKeyDisplay(key)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500">无</span>
              )}
            </div>
          </div>
          
          <div className="min-h-[140px]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">按键统计（Top 5）</h3>
            {Object.keys(keyPresses).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {getTopKeys().map(([key, count]) => (
                  <div 
                    key={key} 
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-center"
                  >
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{getKeyDisplay(key)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{count} 次</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-20 text-sm text-gray-400 dark:text-gray-500">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">需要测试其他硬件吗？</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/keyboard-double" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            键盘双击测试
          </Link>
          <Link 
            href="/mouse-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            鼠标点击计数测试
          </Link>
          <Link 
            href="/mouse-double-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            鼠标双击测试
          </Link>
        </div>
      </div>
    </div>
  );
} 