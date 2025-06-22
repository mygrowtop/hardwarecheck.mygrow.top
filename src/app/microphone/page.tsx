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
  
  // Use refs to store values that don't need to trigger re-rendering
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isRecordingRef = useRef<boolean>(false); // Use ref to track recording state, avoid closure issues
  const monitorGainRef = useRef<GainNode | null>(null);
  
  // Cleanup function
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
        console.error('Failed to disconnect processor:', err);
      }
    }
    
    if (monitorGainRef.current && audioContextRef.current) {
      try {
        monitorGainRef.current.disconnect();
      } catch (err) {
        console.error('Failed to disconnect monitor node:', err);
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
        console.error('Failed to close audio context:', err);
      }
      audioContextRef.current = null;
    }
  };
  
  // Clean up resources when component unmounts
  useEffect(() => {
    // Initialize Canvas
    if (canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      if (canvasCtx) {
        canvasCtx.fillStyle = 'rgb(20, 20, 30)';
        canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Your browser does not support microphone access. Please use the latest version of Chrome, Firefox, or Edge');
      return;
    }
    
    // Get available microphone devices
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setDevices(audioInputs);
        
        if (audioInputs.length > 0) {
          setSelectedDevice(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error('Unable to get device list:', err);
        setErrorMessage('Unable to get microphone device list. Please check browser permissions.');
      }
    };
    
    getDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      getDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      cleanup();
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);
  
  // Sync React state and ref state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);
  
  // Draw spectrum
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
      
      // Calculate volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const volume = Math.min(1, average / 128);
      setVolumeLevel(volume);
      
      // Draw spectrum
      canvasCtx.fillStyle = 'rgb(20, 20, 30)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
      
      const barWidth = (WIDTH / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * HEIGHT;
        
        // Color gradient based on frequency
        const hue = (i / bufferLength) * 120;
        canvasCtx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };
  
  // Toggle monitoring
  const toggleMonitoring = () => {
    if (!audioContextRef.current || !mediaStreamRef.current) {
      return;
    }
    
    if (isMonitoring) {
      // Stop monitoring
      if (monitorGainRef.current) {
        monitorGainRef.current.disconnect();
      }
      setIsMonitoring(false);
    } else {
      // Start monitoring
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 1.0; // Set volume
      
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      monitorGainRef.current = gainNode;
      setIsMonitoring(true);
    }
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      setErrorMessage('');
      cleanup();
      
      // Set state first, avoid React state update delay
      setIsRecording(true);
      isRecordingRef.current = true;
      
      // Try to create audio context
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          throw new Error('Your browser does not support AudioContext');
        }
        audioContextRef.current = new AudioContext();
      } catch (err) {
        throw new Error(`Failed to create audio context: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Make sure recording state is still true (user might have clicked stop while waiting for permission)
      if (!isRecordingRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      mediaStreamRef.current = stream;
      
      const audioContext = audioContextRef.current;
      if (!audioContext) {
        throw new Error('Audio context not initialized');
      }
      
      // Make sure audio context is active
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create analyzer
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      
      // Create audio source
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create script processor node
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      // Process audio data
      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        
        const input = e.inputBuffer.getChannelData(0);
        let sum = 0;
        
        // Calculate volume
        for (let i = 0; i < input.length; i++) {
          sum += Math.abs(input[i]);
        }
        
        const average = sum / input.length;
        const volume = Math.min(1, average * 5); // Amplify volume to make it more visible
        
        setVolumeLevel(volume);
      };
      
      // Connect nodes
      source.connect(analyser);
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      // Start drawing spectrum
      drawSpectrum();
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to start microphone:', err);
      setErrorMessage(`Cannot access microphone: ${errorMsg}`);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setIsMonitoring(false);
    cleanup();
    setVolumeLevel(0);
    
    // Clear canvas
    if (canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      if (canvasCtx) {
        canvasCtx.fillStyle = 'rgb(20, 20, 30)';
        canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };
  
  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Handle device change
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Microphone Test</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test if your microphone is working properly and check audio quality
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-medium">{errorMessage}</p>
              <p className="mt-2 text-sm">Please make sure you have allowed microphone access in your browser.</p>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="device-select">
              Select Microphone Device
            </label>
            <select
              id="device-select"
              value={selectedDevice}
              onChange={handleDeviceChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isRecording}
            >
              {devices.length === 0 ? (
                <option value="">No microphone devices detected</option>
              ) : (
                devices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Volume Level</h3>
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
                    ? '#ef4444' // Red
                    : volumeLevel > 0.5 
                      ? '#f59e0b' // Yellow
                      : '#10b981', // Green
                }}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Spectrum Analysis</h3>
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
              {isRecording ? 'Stop Recording' : 'Start Microphone Test'}
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
                {isMonitoring ? 'Turn Off Sound Monitor' : 'Turn On Sound Monitor'}
              </button>
            )}
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Microphone Usage Tips</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>When speaking, the volume bar should change noticeably</li>
              <li>If the volume bar doesn't react, check your microphone connection</li>
              <li>In noisy environments, background noise may cause the volume bar to display continuously</li>
              <li>When testing, speak at a normal volume and avoid blowing into the microphone</li>
              <li>The sound monitor feature lets you hear your own voice through headphones</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Need to test other hardware?</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/audio" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            onClick={() => isRecordingRef.current && stopRecording()}
          >
            Headphone Sound Test
          </Link>
          <Link 
            href="/display" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            onClick={() => isRecordingRef.current && stopRecording()}
          >
            Display Test
          </Link>
        </div>
      </div>
    </div>
  );
} 