'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function AudioTest() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const [balance, setBalance] = useState<number>(0); // -1 (左) 到 1 (右)
  const [frequency, setFrequency] = useState<number>(440); // 默认为A4音高
  const defaultFrequency = 440; // 默认频率常量
  
  // 音频上下文
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  
  // 测试选项
  const tests = [
    { id: 'left', name: '左声道测试', description: '测试左耳机是否正常工作' },
    { id: 'right', name: '右声道测试', description: '测试右耳机是否正常工作' },
    { id: 'balance', name: '平衡测试', description: '测试左右声道的平衡性' },
    { id: 'frequency', name: '频率测试', description: '测试不同频率下的响应' },
  ];

  // 频率预设
  const frequencyPresets = [
    { value: 60, name: '超低音 (60Hz)' },
    { value: 250, name: '低音 (250Hz)' },
    { value: 440, name: '中音 (440Hz)' },
    { value: 2000, name: '高音 (2000Hz)' },
    { value: 10000, name: '超高音 (10000Hz)' }
  ];
  
  // 初始化音频上下文
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        // 创建音频上下文
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('音频上下文已创建');
      } catch (error) {
        console.error('创建音频上下文失败:', error);
      }
    }
    return audioContextRef.current;
  };
  
  // 确保音频上下文处于活跃状态
  const ensureAudioContext = async () => {
    const audioContext = initAudioContext();
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        console.log('音频上下文已恢复');
      } catch (err) {
        console.error('恢复音频上下文失败:', err);
      }
    }
  };
  
  // 在组件卸载时清理资源
  useEffect(() => {
    return () => {
      stopTest();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
          console.log('音频上下文已关闭');
        } catch (e) {
          console.error('关闭音频上下文失败:', e);
        }
      }
    };
  }, []);
  
  // 停止当前测试
  const stopTest = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // 忽略已经停止的错误
      }
      oscillatorRef.current = null;
    }
    
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch (e) {}
      gainNodeRef.current = null;
    }
    
    if (pannerRef.current) {
      try {
        pannerRef.current.disconnect();
      } catch (e) {}
      pannerRef.current = null;
    }
    
    setActiveTest(null);
  };
  
  // 更新平衡
  const updateBalance = (balanceValue: number) => {
    if (!audioContextRef.current || !pannerRef.current) return;
    pannerRef.current.pan.value = balanceValue;
  };
  
  // 开始测试
  const startTest = async (testId: string) => {
    // 如果点击当前测试，则停止
    if (testId === activeTest) {
      stopTest();
      return;
    }
    
    // 停止当前测试
    stopTest();
    
    // 设置新的测试状态
    setActiveTest(testId);
    
    // 如果不是频率测试，重置频率到默认值
    if (testId !== 'frequency') {
      setFrequency(defaultFrequency);
    }
    
    // 确保音频上下文是活跃的
    await ensureAudioContext();
    if (!audioContextRef.current) return;
    
    try {
      // 创建节点
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();
      pannerRef.current = audioContextRef.current.createStereoPanner();
      
      // 设置振荡器参数
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.value = testId === 'frequency' ? frequency : defaultFrequency;
      
      // 设置音量
      gainNodeRef.current.gain.value = volume;
      
      // 连接节点
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(pannerRef.current);
      pannerRef.current.connect(audioContextRef.current.destination);
      
      // 根据测试类型设置平移
      switch (testId) {
        case 'left':
          pannerRef.current.pan.value = -1; // 全左
          break;
        case 'right':
          pannerRef.current.pan.value = 1; // 全右
          break;
        case 'balance':
          pannerRef.current.pan.value = balance; // 使用平衡滑块的值
          break;
        case 'frequency':
          pannerRef.current.pan.value = 0; // 居中
          break;
      }
      
      // 开始产生声音
      oscillatorRef.current.start();
      console.log(`${testId} 测试已启动`);
      
    } catch (error) {
      console.error('启动测试失败:', error);
      setActiveTest(null);
    }
  };
  
  // 处理音量变化
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };
  
  // 处理平衡变化
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBalance = parseFloat(e.target.value);
    setBalance(newBalance);
    
    // 如果当前在播放声音且是平衡测试，更新平衡
    if (activeTest === 'balance') {
      updateBalance(newBalance);
    }
  };
  
  // 处理频率变化
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrequency = parseInt(e.target.value);
    setFrequency(newFrequency);
    
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = newFrequency;
    }
  };
  
  // 选择频率预设
  const selectFrequencyPreset = (freq: number) => {
    setFrequency(freq);
    
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = freq;
    }
  };
  
  // 用户交互时确保音频上下文可以启动
  const handleUserInteraction = () => {
    ensureAudioContext();
  };
  
  return (
    <div className="container mx-auto px-4 py-8" onClick={handleUserInteraction}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">耳机声音检测</h1>
        <p className="text-gray-600 dark:text-gray-300">
          请确保佩戴耳机并调整系统音量到合适的水平
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">音量控制</h2>
              <span className="text-gray-500 dark:text-gray-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {activeTest === 'balance' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  左右平衡
                </h2>
                <span className="text-gray-500 dark:text-gray-400">
                  {balance === 0 
                    ? "中间" 
                    : balance < 0 
                      ? `左 ${Math.round(Math.abs(balance) * 100)}%` 
                      : `右 ${Math.round(balance * 100)}%`
                  }
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={balance}
                  onChange={handleBalanceChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">左</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">中间</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">右</span>
                </div>
              </div>
            </div>
          )}

          {activeTest === 'frequency' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">频率测试</h2>
                <span className="text-gray-500 dark:text-gray-400">{frequency} Hz</span>
              </div>
              <input
                type="range"
                min="20"
                max="20000"
                step="1"
                value={frequency}
                onChange={handleFrequencyChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {frequencyPresets.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => selectFrequencyPreset(preset.value)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                      frequency === preset.value 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {tests.map(test => (
              <button
                key={test.id}
                onClick={() => startTest(test.id)}
                className={`p-4 rounded-lg text-left transition-all ${
                  activeTest === test.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {test.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {test.description}
                </p>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={stopTest}
              className={`px-6 py-2 rounded-lg font-medium ${
                !activeTest 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
              disabled={!activeTest}
            >
              停止测试
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">使用提示</h2>
          <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
            <li>请佩戴耳机进行测试，以获得最佳效果</li>
            <li>先从低音量开始，然后逐渐调整到合适的音量</li>
            <li>左右声道测试时，您应该只能从一侧耳机听到声音</li>
            <li>点击"平衡测试"按钮，可以调整左右声道的音量比例</li>
            <li>频率测试可以帮助检测耳机的频响范围</li>
            <li>如果听不到某些频率，可能是耳机频响范围的限制或听力问题</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">需要测试其他硬件吗？</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/microphone" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            onClick={stopTest}
          >
            麦克风检测
          </Link>
          <Link 
            href="/display" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            onClick={stopTest}
          >
            屏幕检测
          </Link>
        </div>
      </div>
    </div>
  );
} 