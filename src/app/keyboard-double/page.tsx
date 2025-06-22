'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function KeyboardDoubleClickTest() {
  // Key positions and double click counts
  const [keyPresses, setKeyPresses] = useState<{
    key: string;
    count: number;
    doubleCount: number;
    times: number[];
    lastInterval?: number; // Last key press interval
  }[]>([]);
  
  // Currently selected key
  const [selectedKey, setSelectedKey] = useState<string>('');
  
  // Last pressed key
  const [lastKey, setLastKey] = useState<string>('');
  
  // Double-click time interval (milliseconds) - default is 80ms
  const [doubleClickInterval, setDoubleClickInterval] = useState<number>(80);
  
  // Record click counts and double-click counts
  const [totalPresses, setTotalPresses] = useState<number>(0);
  const [totalDoubleClicks, setTotalDoubleClicks] = useState<number>(0);
  
  // Is test active
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Input area reference
  const inputRef = useRef<HTMLDivElement>(null);
  
  // Last key press interval time
  const [lastKeyInterval, setLastKeyInterval] = useState<number | null>(null);
  
  // Keyboard key mapping for displaying more friendly key names
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
  
  // Get display key name
  const getKeyDisplay = (key: string) => {
    return keyDisplayNames[key] || key;
  };
  
  // Get input area background color based on key interval
  const getInputBoxStyle = () => {
    if (!isActive || lastKeyInterval === null) {
      return {
        backgroundColor: '#f0f4ff', // Default light blue background
        color: '#1e293b'
      };
    }
    
    if (lastKeyInterval <= doubleClickInterval) {
      return {
        backgroundColor: '#fee2e2', // Red background
        color: '#b91c1c' // Red text
      };
    } else if (lastKeyInterval <= doubleClickInterval + 30) {
      return {
        backgroundColor: '#fef3c7', // Yellow background
        color: '#b45309' // Yellow text
      };
    } else {
      return {
        backgroundColor: '#dcfce7', // Green background
        color: '#166534' // Green text
      };
    }
  };
  
  // Handle keyboard keydown events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      e.preventDefault();
      
      const key = e.key;
      const now = Date.now();
      setLastKey(key);
      
      // Check if key already exists
      const keyIndex = keyPresses.findIndex(k => k.key === key);
      
      if (keyIndex === -1) {
        // New key
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
        setLastKeyInterval(null); // First press, no interval
      } else {
        // Existing key
        const updatedPresses = [...keyPresses];
        const keyInfo = updatedPresses[keyIndex];
        
        // Check if it's a double-click (pressing the same key continuously within the set time)
        if (keyInfo.times.length > 0) {
          const lastPressTime = keyInfo.times[keyInfo.times.length - 1];
          const interval = now - lastPressTime;
          
          // Update last key press interval
          keyInfo.lastInterval = interval;
          setLastKeyInterval(interval);
          
          if (interval <= doubleClickInterval) {
            // It's a double-click
            keyInfo.doubleCount += 1;
            setTotalDoubleClicks(prev => prev + 1);
          }
        }
        
        // Update count and time
        keyInfo.count += 1;
        keyInfo.times = [...keyInfo.times.slice(-9), now]; // Keep only the last 10
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
    setLastKeyInterval(null);
    
    // Focus on input area
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
    setLastKeyInterval(null);
  };
  
  // Change the currently selected key
  const selectKey = (key: string) => {
    setSelectedKey(key === selectedKey ? '' : key);
  };
  
  // Get sorted key list
  const getSortedKeys = () => {
    return [...keyPresses].sort((a, b) => b.count - a.count);
  };
  
  // Get display color based on key interval
  const getKeyColorClass = (interval?: number) => {
    if (!interval) return '';
    if (interval <= doubleClickInterval) return 'text-red-600 dark:text-red-400';
    if (interval <= doubleClickInterval + 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };
  
  const inputBoxStyle = getInputBoxStyle();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Keyboard Double Press Test</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test if your keyboard can register double-presses, similar to a mouse double-click test
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Key Presses</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalPresses}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Double Presses</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalDoubleClicks}</div>
            </div>
          </div>
          
          {/* Double-click interval adjustment */}
          <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Double-click Interval</label>
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
              className="w-full h-2 bg-green-500 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>50ms</span>
              <span>500ms</span>
            </div>
          </div>
          
          {/* Input area - changes color based on key interval */}
          <div 
            ref={inputRef}
            tabIndex={0}
            style={inputBoxStyle}
            className="w-full h-32 mb-6 flex items-center justify-center text-center rounded-lg outline-none border-2 border-blue-400 transition-colors duration-300"
          >
            {isActive ? (
              lastKey ? (
                <div className="text-center">
                  <div className="text-sm opacity-75">Last Key</div>
                  <div className="text-3xl font-bold">{getKeyDisplay(lastKey)}</div>
                  {lastKeyInterval !== null && (
                    <div className="text-sm mt-1 opacity-75">
                      Interval: {lastKeyInterval}ms
                    </div>
                  )}
                </div>
              ) : (
                <p>Press any key...</p>
              )
            ) : (
              <p>Click "Start Test" then press keys in this area</p>
            )}
          </div>
          
          {/* Button group */}
          <div className="flex space-x-4 mb-6">
            {!isActive ? (
              <button
                onClick={startTest}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all"
              >
                Start Test
              </button>
            ) : (
              <button
                onClick={stopTest}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all"
              >
                Stop Test
              </button>
            )}
            <button
              onClick={resetTest}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
            >
              Reset
            </button>
          </div>
          
          {/* Key info table */}
          <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm font-medium">
              <div className="w-1/3 text-gray-500 dark:text-gray-300">Key</div>
              <div className="w-1/3 text-center text-gray-500 dark:text-gray-300">Press Count</div>
              <div className="w-1/3 text-center text-gray-500 dark:text-gray-300">Double Press Count</div>
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
                    <div className={`w-1/3 font-medium ${getKeyColorClass(keyInfo.lastInterval)}`}>
                      {getKeyDisplay(keyInfo.key)}
                    </div>
                    <div className="w-1/3 text-center text-gray-700 dark:text-gray-300">{keyInfo.count}</div>
                    <div className="w-1/3 text-center text-gray-700 dark:text-gray-300">{keyInfo.doubleCount}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No key data yet
                </div>
              )}
            </div>
          </div>
          
          {/* Selected key detailed info */}
          {selectedKey && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time records for key {getKeyDisplay(selectedKey)}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {keyPresses.find(k => k.key === selectedKey)?.times.map((time, index, arr) => {
                  if (index === 0) return null; // Skip the first timestamp, as there's no interval
                  
                  const interval = time - arr[index-1];
                  let colorClass = '';
                  
                  if (interval <= doubleClickInterval) {
                    colorClass = 'text-red-600 dark:text-red-400 font-medium';
                  } else if (interval <= doubleClickInterval + 30) {
                    colorClass = 'text-yellow-600 dark:text-yellow-400 font-medium';
                  } else {
                    colorClass = 'text-green-600 dark:text-green-400';
                  }
                  
                  return (
                    <div key={index} className={`mb-1 ${colorClass}`}>
                      <span>Interval: {interval}ms {interval <= doubleClickInterval && '(Double Press)'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Test Instructions</h3>
        <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
          Quickly press and release a key several times. The input box background will change color based on press interval:
          Red indicates an interval less than the set double-click time; Yellow indicates within 30ms over the double-click time; Green indicates more than the double-click time+30ms.
        </p>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Need to test other hardware?</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/keyboard" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Keyboard Counter Test
          </Link>
          <Link 
            href="/mouse-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Mouse Click Counter
          </Link>
          <Link 
            href="/mouse-double-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Mouse Double Click Test
          </Link>
        </div>
      </div>
    </div>
  );
} 