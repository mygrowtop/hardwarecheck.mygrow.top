'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MouseDoubleClickTest() {
  // 点击计数
  const [leftClicks, setLeftClicks] = useState<number>(0);
  const [rightClicks, setRightClicks] = useState<number>(0);
  const [leftDoubleClicks, setLeftDoubleClicks] = useState<number>(0);
  const [rightDoubleClicks, setRightDoubleClicks] = useState<number>(0);
  
  // 时间间隔设置（单位：毫秒）- 默认为80毫秒
  const [doubleClickInterval, setDoubleClickInterval] = useState<number>(80);
  
  // 双击检测
  const lastLeftClickRef = useRef<number>(0);
  const lastRightClickRef = useRef<number>(0);
  
  // 记录
  const [doubleClickRecords, setDoubleClickRecords] = useState<{
    leftClicks: number, 
    rightClicks: number, 
    leftDoubleClicks: number, 
    rightDoubleClicks: number, 
    date: string
  }[]>([]);

  useEffect(() => {
    // 从本地存储加载记录
    try {
      const savedDoubleClickRecords = localStorage.getItem('doubleClickRecords');
      if (savedDoubleClickRecords) {
        setDoubleClickRecords(JSON.parse(savedDoubleClickRecords));
      }
    } catch (error) {
      console.error('加载记录失败:', error);
    }
  }, []);

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
  const resetTest = () => {
    setLeftClicks(0);
    setRightClicks(0);
    setLeftDoubleClicks(0);
    setRightDoubleClicks(0);
    lastLeftClickRef.current = 0;
    lastRightClickRef.current = 0;
  };

  // 保存结果
  const saveResults = () => {
    // 保存测试记录
    const newRecord = {
      leftClicks,
      rightClicks,
      leftDoubleClicks,
      rightDoubleClicks,
      date: new Date().toLocaleString()
    };
    
    const updatedRecords = [...doubleClickRecords, newRecord].slice(-5); // 只保留最近5条记录
    setDoubleClickRecords(updatedRecords);
    try {
      localStorage.setItem('doubleClickRecords', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('保存记录失败:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">鼠标双击测试</h1>
        <p className="text-gray-600 dark:text-gray-300">
          测试您的鼠标左右键双击功能，检查是否正常工作
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
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
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>50ms</span>
              <span>500ms</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div 
              className="bg-red-500 hover:bg-red-400 rounded-lg h-64 flex items-center justify-center cursor-pointer transition-colors duration-200"
              onClick={handleLeftClick}
              onContextMenu={handleRightClick}
            >
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full"></div>
                </div>
              </div>
              <p className="absolute bottom-4 text-white font-medium">左键测试区域</p>
            </div>

            <div 
              className="bg-red-500 hover:bg-red-400 rounded-lg h-64 flex items-center justify-center cursor-pointer transition-colors duration-200"
              onClick={handleLeftClick}
              onContextMenu={handleRightClick}
            >
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full"></div>
                </div>
              </div>
              <p className="absolute bottom-4 text-white font-medium">右键测试区域</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={resetTest}
              className="py-3 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
            >
              重置测试
            </button>
            <button
              onClick={saveResults}
              className="py-3 text-center bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
            >
              保存记录
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          双击测试说明: 在测试区域中快速连续点击两次鼠标，如果双击间隔小于设定值，将被记为一次双击。
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">测试记录</h2>
        {doubleClickRecords.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">日期</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">左键点击</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">左键双击</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">右键点击</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">右键双击</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {doubleClickRecords.map((record, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{record.date}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 text-center">{record.leftClicks}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 text-center">{record.leftDoubleClicks}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 text-center">{record.rightClicks}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 text-center">{record.rightDoubleClicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">没有双击测试记录</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">需要测试其他硬件吗？</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/mouse-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            鼠标点击计数测试
          </Link>
          <Link 
            href="/mouse-move" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            鼠标滑动检测
          </Link>
          <Link 
            href="/keyboard" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            键盘连击检测
          </Link>
        </div>
      </div>
    </div>
  );
} 