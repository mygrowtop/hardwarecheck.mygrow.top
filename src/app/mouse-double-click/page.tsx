'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MouseDoubleClickTest() {
  // Click counter
  const [leftClicks, setLeftClicks] = useState<number>(0);
  const [rightClicks, setRightClicks] = useState<number>(0);
  const [leftDoubleClicks, setLeftDoubleClicks] = useState<number>(0);
  const [rightDoubleClicks, setRightDoubleClicks] = useState<number>(0);
  
  // Time interval setting (unit: milliseconds) - default is 80ms
  const [doubleClickInterval, setDoubleClickInterval] = useState<number>(80);
  
  // Double-click detection
  const lastLeftClickRef = useRef<number>(0);
  const lastRightClickRef = useRef<number>(0);
  
  // Records
  const [doubleClickRecords, setDoubleClickRecords] = useState<{
    leftClicks: number, 
    rightClicks: number, 
    leftDoubleClicks: number, 
    rightDoubleClicks: number, 
    date: string
  }[]>([]);

  useEffect(() => {
    // Load records from local storage
    try {
      const savedDoubleClickRecords = localStorage.getItem('doubleClickRecords');
      if (savedDoubleClickRecords) {
        setDoubleClickRecords(JSON.parse(savedDoubleClickRecords));
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  }, []);

  // Left/right click handler
  const handleLeftClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLeftClicks(leftClicks + 1);
    
    // Detect double-click
    const now = Date.now();
    if (now - lastLeftClickRef.current <= doubleClickInterval) {
      setLeftDoubleClicks(leftDoubleClicks + 1);
    }
    lastLeftClickRef.current = now;
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setRightClicks(rightClicks + 1);
    
    // Detect double-click
    const now = Date.now();
    if (now - lastRightClickRef.current <= doubleClickInterval) {
      setRightDoubleClicks(rightDoubleClicks + 1);
    }
    lastRightClickRef.current = now;
  };

  // Reset test
  const resetTest = () => {
    setLeftClicks(0);
    setRightClicks(0);
    setLeftDoubleClicks(0);
    setRightDoubleClicks(0);
    lastLeftClickRef.current = 0;
    lastRightClickRef.current = 0;
  };

  // Save results
  const saveResults = () => {
    // Save test records
    const newRecord = {
      leftClicks,
      rightClicks,
      leftDoubleClicks,
      rightDoubleClicks,
      date: new Date().toLocaleString()
    };
    
    const updatedRecords = [...doubleClickRecords, newRecord].slice(-5); // Keep only the last 5 records
    setDoubleClickRecords(updatedRecords);
    try {
      localStorage.setItem('doubleClickRecords', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Failed to save records:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Mouse Double Click Test</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test your mouse's left and right double-click function to verify if it's working properly
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Left Clicks</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{leftClicks}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Left Double Clicks</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{leftDoubleClicks}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Right Clicks</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{rightClicks}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Right Double Clicks</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{rightDoubleClicks}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Double Click Interval (milliseconds)</label>
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
              <p className="absolute bottom-4 text-white font-medium">Left Click Test Area</p>
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
              <p className="absolute bottom-4 text-white font-medium">Right Click Test Area</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={resetTest}
              className="py-3 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
            >
              Reset Test
            </button>
            <button
              onClick={saveResults}
              className="py-3 text-center bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
            >
              Save Record
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Double Click Test Instructions: Quickly click your mouse twice in the test area. If the interval between clicks is less than the set value, it will be recorded as a double click.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Test Records</h2>
        {doubleClickRecords.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Date</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Left Clicks</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Left Double Clicks</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Right Clicks</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Right Double Clicks</th>
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
          <p className="text-gray-500 dark:text-gray-400 text-center">No double click test records</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Need to test other hardware?</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/mouse-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Mouse Click Counter
          </Link>
          <Link 
            href="/mouse-move" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Mouse Movement Test
          </Link>
          <Link 
            href="/keyboard" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Keyboard Counter Test
          </Link>
        </div>
      </div>
    </div>
  );
} 