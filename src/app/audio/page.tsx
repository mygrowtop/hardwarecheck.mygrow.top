'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function AudioTest() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const [balance, setBalance] = useState<number>(0); // -1 (left) to 1 (right)
  const [frequency, setFrequency] = useState<number>(440); // Default to A4 pitch
  const defaultFrequency = 440; // Default frequency constant
  
  // Audio context
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  
  // Test options
  const tests = [
    { id: 'left', name: 'Left Channel Test', description: 'Test if left earphone works properly' },
    { id: 'right', name: 'Right Channel Test', description: 'Test if right earphone works properly' },
    { id: 'balance', name: 'Balance Test', description: 'Test the balance between left and right channels' },
    { id: 'frequency', name: 'Frequency Test', description: 'Test response at different frequencies' },
  ];

  // Frequency presets
  const frequencyPresets = [
    { value: 60, name: 'Sub-bass (60Hz)' },
    { value: 250, name: 'Bass (250Hz)' },
    { value: 440, name: 'Mid-range (440Hz)' },
    { value: 2000, name: 'Treble (2000Hz)' },
    { value: 10000, name: 'High Treble (10000Hz)' }
  ];
  
  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('Audio context created');
      } catch (error) {
        console.error('Failed to create audio context:', error);
      }
    }
    return audioContextRef.current;
  };
  
  // Ensure audio context is active
  const ensureAudioContext = async () => {
    const audioContext = initAudioContext();
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        console.log('Audio context resumed');
      } catch (err) {
        console.error('Failed to resume audio context:', err);
      }
    }
  };
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      stopTest();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
          console.log('Audio context closed');
        } catch (e) {
          console.error('Failed to close audio context:', e);
        }
      }
    };
  }, []);
  
  // Stop current test
  const stopTest = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Ignore errors for already stopped oscillators
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
  
  // Update balance
  const updateBalance = (balanceValue: number) => {
    if (!audioContextRef.current || !pannerRef.current) return;
    pannerRef.current.pan.value = balanceValue;
  };
  
  // Start test
  const startTest = async (testId: string) => {
    // If clicking the current test, stop it
    if (testId === activeTest) {
      stopTest();
      return;
    }
    
    // Stop current test
    stopTest();
    
    // Set new test state
    setActiveTest(testId);
    
    // If not a frequency test, reset frequency to default
    if (testId !== 'frequency') {
      setFrequency(defaultFrequency);
    }
    
    // Ensure audio context is active
    await ensureAudioContext();
    if (!audioContextRef.current) return;
    
    try {
      // Create nodes
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();
      pannerRef.current = audioContextRef.current.createStereoPanner();
      
      // Set oscillator parameters
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.value = testId === 'frequency' ? frequency : defaultFrequency;
      
      // Set volume
      gainNodeRef.current.gain.value = volume;
      
      // Connect nodes
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(pannerRef.current);
      pannerRef.current.connect(audioContextRef.current.destination);
      
      // Set panning based on test type
      switch (testId) {
        case 'left':
          pannerRef.current.pan.value = -1; // Full left
          break;
        case 'right':
          pannerRef.current.pan.value = 1; // Full right
          break;
        case 'balance':
          pannerRef.current.pan.value = balance; // Use balance slider value
          break;
        case 'frequency':
          pannerRef.current.pan.value = 0; // Center
          break;
      }
      
      // Start generating sound
      oscillatorRef.current.start();
      console.log(`${testId} test started`);
      
    } catch (error) {
      console.error('Failed to start test:', error);
      setActiveTest(null);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };
  
  // Handle balance change
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBalance = parseFloat(e.target.value);
    setBalance(newBalance);
    
    // If currently playing sound and it's a balance test, update balance
    if (activeTest === 'balance') {
      updateBalance(newBalance);
    }
  };
  
  // Handle frequency change
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrequency = parseInt(e.target.value);
    setFrequency(newFrequency);
    
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = newFrequency;
    }
  };
  
  // Select frequency preset
  const selectFrequencyPreset = (freq: number) => {
    setFrequency(freq);
    
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = freq;
    }
  };
  
  // Ensure audio context can start on user interaction
  const handleUserInteraction = () => {
    ensureAudioContext();
  };
  
  return (
    <div className="container mx-auto px-4 py-8" onClick={handleUserInteraction}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Headphone Sound Test</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Please wear headphones and adjust your system volume to an appropriate level
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Volume Control</h2>
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
                  Left/Right Balance
                </h2>
                <span className="text-gray-500 dark:text-gray-400">
                  {balance === 0 
                    ? "Center" 
                    : balance < 0 
                      ? `Left ${Math.round(Math.abs(balance) * 100)}%` 
                      : `Right ${Math.round(balance * 100)}%`
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">Left</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Center</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Right</span>
                </div>
              </div>
            </div>
          )}

          {activeTest === 'frequency' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Frequency Test</h2>
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
              Stop Test
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Usage Tips</h2>
          <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
            <li>Please wear headphones during testing for best results</li>
            <li>Start with low volume and gradually adjust to a comfortable level</li>
            <li>During left/right channel tests, you should only hear sound from one side</li>
            <li>Click the "Balance Test" button to adjust the volume ratio between left and right channels</li>
            <li>The frequency test helps check your headphones' frequency response range</li>
            <li>If you can't hear certain frequencies, it may be due to headphone limitations or hearing issues</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Need to test other hardware?</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/microphone" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            onClick={stopTest}
          >
            Microphone Test
          </Link>
          <Link 
            href="/display" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            onClick={stopTest}
          >
            Display Test
          </Link>
        </div>
      </div>
    </div>
  );
} 