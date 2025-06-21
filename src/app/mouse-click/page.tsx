'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MouseClickTest() {
  // 点击计数
  const [leftClicks, setLeftClicks] = useState<number>(0);
  const [rightClicks, setRightClicks] = useState<number>(0);
  const [leftDoubleClicks, setLeftDoubleClicks] = useState<number>(0);
  const [rightDoubleClicks, setRightDoubleClicks] = useState<number>(0);
  
  // 时间间隔设置（单位：毫秒）
  const [interval, setInterval] = useState<number>(100);
  
  // 测试状态
  const [testMode, setTestMode] = useState<string>("DOUBLI CLICK TEST");
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // 双击检测
  const lastLeftClickRef = useRef<number>(0);
  const lastRightClickRef = useRef<number>(0);
  
  // 记录
  const [records, setRecords] = useState<{
    leftClicks: number,
    rightClicks: number, 
    leftDoubleClicks: number, 
    rightDoubleClicks: number,
    date: string
  }[]>([]);

  useEffect(() => {
    // 从本地存储加载记录
    try {
      const savedRecords = localStorage.getItem('mouseClickRecords');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    } catch (error) {
      console.error('加载记录失败:', error);
    }
  }, []);

  const handleLeftClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLeftClicks(leftClicks + 1);
    
    // 检测双击
    const now = Date.now();
    if (now - lastLeftClickRef.current <= interval) {
      setLeftDoubleClicks(leftDoubleClicks + 1);
    }
    lastLeftClickRef.current = now;
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setRightClicks(rightClicks + 1);
    
    // 检测双击
    const now = Date.now();
    if (now - lastRightClickRef.current <= interval) {
      setRightDoubleClicks(rightDoubleClicks + 1);
    }
    lastRightClickRef.current = now;
  };

  const resetTest = () => {
    setLeftClicks(0);
    setRightClicks(0);
    setLeftDoubleClicks(0);
    setRightDoubleClicks(0);
    lastLeftClickRef.current = 0;
    lastRightClickRef.current = 0;
  };

  const saveResults = () => {
    // 保存测试记录
    const newRecord = {
      leftClicks: leftClicks,
      rightClicks: rightClicks,
      leftDoubleClicks: leftDoubleClicks,
      rightDoubleClicks: rightDoubleClicks,
      date: new Date().toLocaleString()
    };
    
    const updatedRecords = [...records, newRecord].slice(-5); // 只保留最近5条记录
    setRecords(updatedRecords);
    try {
      localStorage.setItem('mouseClickRecords', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('保存记录失败:', error);
    }
  };

  const startNewGame = () => {
    resetTest();
    setIsActive(true);
  };

  // 处理时间间隔输入
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setInterval(value);
    }
  };

  // 处理测试模式切换
  const handleTestModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTestMode(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 py-8 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-white">{testMode}</h1>
          <p className="text-gray-300">
            测试显示您的当前结果和最佳结果！测试您的点击速度，向朋友证明您是最快的！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-700 rounded-md p-4 text-center">
            <span className="text-3xl font-bold text-white">{leftClicks}</span>
            <p className="text-gray-300 uppercase">左键点击</p>
          </div>
          <div className="bg-gray-700 rounded-md p-4 text-center">
            <span className="text-3xl font-bold text-white">{leftDoubleClicks}</span>
            <p className="text-gray-300 uppercase">左键双击</p>
          </div>
          <div className="bg-gray-700 rounded-md p-4 text-center">
            <span className="text-3xl font-bold text-white">{rightClicks}</span>
            <p className="text-gray-300 uppercase">右键点击</p>
          </div>
          <div className="bg-gray-700 rounded-md p-4 text-center">
            <span className="text-3xl font-bold text-white">{rightDoubleClicks}</span>
            <p className="text-gray-300 uppercase">右键双击</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 左键测试区域 */}
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
          </div>

          {/* 右键测试区域 */}
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
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-lg text-gray-300 mb-4">
            进行此双击测试，测试您的鼠标双击功能或练习如何快速双击
          </p>
        </div>

        <div className="bg-gray-700 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-between">
            <div className="mb-6 w-full md:w-1/2 px-2">
              <h3 className="text-gray-300 mb-2 uppercase font-bold">选择测试</h3>
              <select 
                className="w-full bg-gray-800 text-white rounded-md p-3"
                value={testMode}
                onChange={handleTestModeChange}
              >
                <option value="DOUBLI CLICK TEST">双击测试</option>
                <option value="SINGLE CLICK TEST">单击测试</option>
              </select>
            </div>

            <div className="mb-6 w-full md:w-1/2 px-2">
              <h3 className="text-gray-300 mb-2 uppercase font-bold">设置间隔 MS</h3>
              <input 
                type="number" 
                value={interval}
                onChange={handleIntervalChange}
                className="w-full bg-gray-800 text-white rounded-md p-3"
                min="50"
                max="500"
              />
            </div>

            <div className="w-full flex flex-wrap">
              <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-md bg-gray-800 flex items-center justify-center text-gray-300 cursor-pointer">
                    左键点击
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 px-2">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-md bg-gray-800 flex items-center justify-center text-gray-300 cursor-pointer">
                    右键点击
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={startNewGame}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-bold transition-colors"
            >
              开始新游戏
            </button>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-4">关于双击测试</h3>
          <p className="text-gray-300 mb-4">
            探索我们的点击游戏，可检测和测量重复点击。自定义以毫秒为单位的时间间隔，以确定何时不应计算多次点击。使用左右鼠标按钮测试您的点击准确性。跟踪点击之间的时间并挑战自己以最小化重复点击。
          </p>
        </div>
      </div>
    </div>
  );
} 