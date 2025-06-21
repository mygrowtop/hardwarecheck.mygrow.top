'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MouseClickTest() {
  // 点击计数测试状态
  const [clicks, setClicks] = useState<number>(0);
  const [cps, setCps] = useState<number>(0);
  const [maxCps, setMaxCps] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [records, setRecords] = useState<{cps: number, clicks: number, date: string}[]>([]);
  
  // 使用ref来存储开始时间和点击历史
  const startTimeRef = useRef<number>(0);
  const clickTimesRef = useRef<number[]>([]);
  const cpsIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
            
            // 保存记录
            const newRecord = {
              cps: Math.round(finalCps * 10) / 10,
              clicks: clicks,
              date: new Date().toLocaleString()
            };
            
            const updatedRecords = [...records, newRecord].slice(-5); // 只保留最近5条记录
            setRecords(updatedRecords);
            try {
              localStorage.setItem('mouseClickRecords', JSON.stringify(updatedRecords));
            } catch (error) {
              console.error('保存记录失败:', error);
            }
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, clicks, records]);

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
  const resetTest = () => {
    setIsActive(false);
    setClicks(0);
    setCps(0);
    setMaxCps(0);
    setTimeLeft(10);
    startTimeRef.current = 0;
    clickTimesRef.current = [];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">鼠标点击计数测试</h1>
        <p className="text-gray-600 dark:text-gray-300">
          测试你的鼠标点击速度，检查每秒点击次数(CPS)
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
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
              onClick={resetTest}
              className="w-full py-3 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
            >
              重新测试
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">测试记录</h2>
        {records.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">日期</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-300">点击数</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-300">CPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((record, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{record.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center">{record.clicks}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center">{record.cps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">没有测试记录</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">需要测试其他硬件吗？</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/mouse-double-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            鼠标双击测试
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