'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function KeyboardDoubleClickTest() {
  // 键位和双击次数
  const [keyPresses, setKeyPresses] = useState<{
    key: string;
    count: number;
    doubleCount: number;
    times: number[];
  }[]>([]);
  
  // 当前选中的键位
  const [selectedKey, setSelectedKey] = useState<string>('');
  
  // 上次按下的键
  const [lastKey, setLastKey] = useState<string>('');
  
  // 双击时间间隔（毫秒）
  const [doubleClickInterval, setDoubleClickInterval] = useState<number>(200);
  
  // 记录点击次数和双击次数
  const [totalPresses, setTotalPresses] = useState<number>(0);
  const [totalDoubleClicks, setTotalDoubleClicks] = useState<number>(0);
  
  // 测试是否激活
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // 输入区域引用
  const inputRef = useRef<HTMLDivElement>(null);
  
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
  
  // 获取显示的按键名
  const getKeyDisplay = (key: string) => {
    return keyDisplayNames[key] || key;
  };
  
  // 处理键盘按下事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      e.preventDefault();
      
      const key = e.key;
      const now = Date.now();
      setLastKey(key);
      
      // 检查按键是否已存在
      const keyIndex = keyPresses.findIndex(k => k.key === key);
      
      if (keyIndex === -1) {
        // 新键位
        setKeyPresses(prev => [
          ...prev,
          {
            key,
            count: 1,
            doubleCount: 0,
            times: [now]
          }
        ]);
        setTotalPresses(prev => prev + 1);
      } else {
        // 已存在的键位
        const updatedPresses = [...keyPresses];
        const keyInfo = updatedPresses[keyIndex];
        
        // 检查是否是双击（在设定时间内连续按下同一按键）
        if (keyInfo.times.length > 0) {
          const lastPressTime = keyInfo.times[keyInfo.times.length - 1];
          
          if (now - lastPressTime <= doubleClickInterval) {
            // 是双击
            keyInfo.doubleCount += 1;
            setTotalDoubleClicks(prev => prev + 1);
          }
        }
        
        // 更新计数和时间
        keyInfo.count += 1;
        keyInfo.times = [...keyInfo.times.slice(-9), now]; // 只保留最近10次
        updatedPresses[keyIndex] = keyInfo;
        
        setKeyPresses(updatedPresses);
        setTotalPresses(prev => prev + 1);
      }
    };
    
    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, keyPresses, doubleClickInterval]);
  
  const startTest = () => {
    setIsActive(true);
    setKeyPresses([]);
    setLastKey('');
    setTotalPresses(0);
    setTotalDoubleClicks(0);
    
    // 聚焦到输入区域
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const stopTest = () => {
    setIsActive(false);
  };
  
  const resetTest = () => {
    setIsActive(false);
    setKeyPresses([]);
    setLastKey('');
    setTotalPresses(0);
    setTotalDoubleClicks(0);
  };
  
  // 更改当前选中的键
  const selectKey = (key: string) => {
    setSelectedKey(key === selectedKey ? '' : key);
  };
  
  // 获取排序后的按键列表
  const getSortedKeys = () => {
    return [...keyPresses].sort((a, b) => b.count - a.count);
  };
  
  // 根据双击间隔选择颜色
  const getIntervalColor = () => {
    if (doubleClickInterval <= 80) return 'bg-red-500';
    if (doubleClickInterval <= 150) return 'bg-yellow-500';
    if (doubleClickInterval <= 300) return 'bg-green-500';
    return 'bg-blue-500';
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">键盘双击测试</h1>
        <p className="text-gray-600 dark:text-gray-300">
          测试您的键盘是否可以双击，类似于鼠标双击测试
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">键盘点击次数</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalPresses}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">双击次数</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalDoubleClicks}</div>
            </div>
          </div>
          
          {/* 双击间隔调整 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">双击时间间隔</label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {doubleClickInterval} ms
              </span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="500" 
              step="10" 
              value={doubleClickInterval} 
              onChange={(e) => setDoubleClickInterval(parseInt(e.target.value))} 
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${getIntervalColor()}`}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>50ms</span>
              <span>500ms</span>
            </div>
          </div>
          
          {/* 输入区域 */}
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
          
          {/* 按钮组 */}
          <div className="flex space-x-4 mb-6">
            {!isActive ? (
              <button
                onClick={startTest}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all"
              >
                开始测试
              </button>
            ) : (
              <button
                onClick={stopTest}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all"
              >
                停止测试
              </button>
            )}
            <button
              onClick={resetTest}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
            >
              重置
            </button>
          </div>
          
          {/* 按键信息表格 */}
          <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm font-medium">
              <div className="w-1/3 text-gray-500 dark:text-gray-300">键位</div>
              <div className="w-1/3 text-center text-gray-500 dark:text-gray-300">点击次数</div>
              <div className="w-1/3 text-center text-gray-500 dark:text-gray-300">双击次数</div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {getSortedKeys().length > 0 ? (
                getSortedKeys().map((keyInfo) => (
                  <div 
                    key={keyInfo.key} 
                    onClick={() => selectKey(keyInfo.key)}
                    className={`flex px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${
                      selectedKey === keyInfo.key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="w-1/3 font-medium text-gray-900 dark:text-white">{getKeyDisplay(keyInfo.key)}</div>
                    <div className="w-1/3 text-center text-gray-700 dark:text-gray-300">{keyInfo.count}</div>
                    <div className="w-1/3 text-center text-gray-700 dark:text-gray-300">{keyInfo.doubleCount}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  暂无按键数据
                </div>
              )}
            </div>
          </div>
          
          {/* 选中按键的详细信息 */}
          {selectedKey && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {getKeyDisplay(selectedKey)} 键的时间记录
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {keyPresses.find(k => k.key === selectedKey)?.times.map((time, index, arr) => {
                  const isDouble = index > 0 && (time - arr[index-1] <= doubleClickInterval);
                  return (
                    <div key={index} className={`mb-1 ${isDouble ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                      {index > 0 && (
                        <span>间隔: {time - arr[index-1]}ms {isDouble && '(双击)'}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">测试说明</h3>
        <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
          快速按下并释放该键数次。如果键名变为红色，则表示存在重复输入问题。
          双击的次数会与在对应的行上。双击时间间隔可以通过滑块进行调整。
        </p>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">需要测试其他硬件吗？</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/keyboard" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            键盘计数测试
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