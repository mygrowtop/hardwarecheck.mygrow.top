'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MicrophoneTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // 使用refs存储不需要触发重渲染的值
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isRecordingRef = useRef<boolean>(false); // 使用ref跟踪录音状态，避免闭包问题
  const monitorGainRef = useRef<GainNode | null>(null);
  
  // 清理函数
  const cleanup = () => {
    isRecordingRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (processorRef.current && audioContextRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (err) {
        console.error('断开处理器连接失败:', err);
      }
    }
    
    if (monitorGainRef.current && audioContextRef.current) {
      try {
        monitorGainRef.current.disconnect();
      } catch (err) {
        console.error('断开监听节点失败:', err);
      }
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (err) {
        console.error('关闭音频上下文失败:', err);
      }
      audioContextRef.current = null;
    }
  };
  
  // 组件卸载时清理资源
  useEffect(() => {
    // 初始化Canvas
    if (canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      if (canvasCtx) {
        canvasCtx.fillStyle = 'rgb(20, 20, 30)';
        canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    // 检查浏览器支持
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('您的浏览器不支持麦克风访问功能，请使用最新版的Chrome、Firefox或Edge浏览器');
      return;
    }
    
    // 获取可用麦克风设备
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setDevices(audioInputs);
        
        if (audioInputs.length > 0) {
          setSelectedDevice(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error('无法获取设备列表:', err);
        setErrorMessage('无法获取麦克风设备列表，请检查浏览器权限。');
      }
    };
    
    getDevices();
    
    // 监听设备变更
    const handleDeviceChange = () => {
      getDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      cleanup();
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);
  
  // 同步React状态和ref状态
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);
  
  // 绘制频谱
  const drawSpectrum = () => {
    if (!analyserRef.current || !canvasRef.current) {
      return;
    }
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
      return;
    }
    
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isRecordingRef.current) {
        return;
      }
      
      if (!analyserRef.current || !canvasRef.current) {
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // 计算音量
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const volume = Math.min(1, average / 128);
      setVolumeLevel(volume);
      
      // 绘制频谱
      canvasCtx.fillStyle = 'rgb(20, 20, 30)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
      
      const barWidth = (WIDTH / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * HEIGHT;
        
        // 基于频率的色彩渐变
        const hue = (i / bufferLength) * 120;
        canvasCtx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };
  
  // 切换监听状态
  const toggleMonitoring = () => {
    if (!audioContextRef.current || !mediaStreamRef.current) {
      return;
    }
    
    if (isMonitoring) {
      // 停止监听
      if (monitorGainRef.current) {
        monitorGainRef.current.disconnect();
      }
      setIsMonitoring(false);
    } else {
      // 开始监听
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 1.0; // 设置音量
      
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      monitorGainRef.current = gainNode;
      setIsMonitoring(true);
    }
  };
  
  // 开始录音
  const startRecording = async () => {
    try {
      setErrorMessage('');
      cleanup();
      
      // 先设置状态，避免React状态更新延迟
      setIsRecording(true);
      isRecordingRef.current = true;
      
      // 尝试创建音频上下文
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          throw new Error('您的浏览器不支持AudioContext');
        }
        audioContextRef.current = new AudioContext();
      } catch (err) {
        throw new Error(`创建音频上下文失败: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // 确保录音状态仍然为true（用户可能在等待权限时点击了停止）
      if (!isRecordingRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      mediaStreamRef.current = stream;
      
      const audioContext = audioContextRef.current;
      if (!audioContext) {
        throw new Error('音频上下文未初始化');
      }
      
      // 确保音频上下文处于活跃状态
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // 创建分析器
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      
      // 创建音频源
      const source = audioContext.createMediaStreamSource(stream);
      
      // 创建脚本处理节点 (ScriptProcessorNode)
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      // 处理音频数据
      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        
        const input = e.inputBuffer.getChannelData(0);
        let sum = 0;
        
        // 计算音量
        for (let i = 0; i < input.length; i++) {
          sum += Math.abs(input[i]);
        }
        
        const average = sum / input.length;
        const volume = Math.min(1, average * 5); // 放大音量以使其更明显
        
        setVolumeLevel(volume);
      };
      
      // 连接节点
      source.connect(analyser);
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      // 开始绘制频谱
      drawSpectrum();
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('启动麦克风失败:', err);
      setErrorMessage(`无法访问麦克风: ${errorMsg}`);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };
  
  // 停止录音
  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setIsMonitoring(false);
    cleanup();
    setVolumeLevel(0);
    
    // 清空画布
    if (canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      if (canvasCtx) {
        canvasCtx.fillStyle = 'rgb(20, 20, 30)';
        canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };
  
  // 切换录音状态
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // 处理设备变更
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDevice(e.target.value);
    if (isRecording) {
      stopRecording();
      setTimeout(() => {
        startRecording();
      }, 300);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">麦克风检测</h1>
        <p className="text-gray-600 dark:text-gray-300">
          测试您的麦克风是否正常工作并检查音频质量
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-medium">{errorMessage}</p>
              <p className="mt-2 text-sm">请确保您已在浏览器中允许访问麦克风。</p>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="device-select">
              选择麦克风设备
            </label>
            <select
              id="device-select"
              value={selectedDevice}
              onChange={handleDeviceChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isRecording}
            >
              {devices.length === 0 ? (
                <option value="">未检测到麦克风设备</option>
              ) : (
                devices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `麦克风 ${device.deviceId.slice(0, 5)}...`}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">音量级别</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(volumeLevel * 100)}%
              </span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-100 ease-out"
                style={{
                  width: `${volumeLevel * 100}%`,
                  backgroundColor: volumeLevel > 0.8 
                    ? '#ef4444' // 红色
                    : volumeLevel > 0.5 
                      ? '#f59e0b' // 黄色
                      : '#10b981', // 绿色
                }}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">频谱分析</h3>
            <canvas 
              ref={canvasRef} 
              width="600" 
              height="200" 
              className="w-full h-48 bg-gray-900 rounded-lg"
            />
          </div>
          
          <div className="mb-6 text-center space-x-4">
            <button
              onClick={toggleRecording}
              className={`px-6 py-3 rounded-lg font-medium ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isRecording ? '停止录音' : '开始测试麦克风'}
            </button>
            
            {isRecording && (
              <button
                onClick={toggleMonitoring}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isMonitoring
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {isMonitoring ? '关闭声音监听' : '开启声音监听'}
              </button>
            )}
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">麦克风使用提示</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>说话时，音量条应该有明显变化</li>
              <li>如果音量条没有反应，请检查您的麦克风连接</li>
              <li>在嘈杂环境中，背景噪音可能导致音量条持续显示</li>
              <li>测试时请使用正常音量说话，避免对着麦克风吹气</li>
              <li>开启声音监听功能可以通过耳机听到自己的声音</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">需要测试其他硬件吗？</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/audio" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            onClick={() => isRecordingRef.current && stopRecording()}
          >
            耳机声音检测
          </Link>
          <Link 
            href="/display" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            onClick={() => isRecordingRef.current && stopRecording()}
          >
            屏幕检测
          </Link>
        </div>
      </div>
    </div>
  );
} 