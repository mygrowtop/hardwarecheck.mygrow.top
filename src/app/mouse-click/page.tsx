'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MouseClickTest() {
  // Click counter test state
  const [clicks, setClicks] = useState<number>(0);
  const [cps, setCps] = useState<number>(0);
  const [maxCps, setMaxCps] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [records, setRecords] = useState<{cps: number, clicks: number, date: string}[]>([]);
  
  // Use ref to store start time and click history
  const startTimeRef = useRef<number>(0);
  const clickTimesRef = useRef<number[]>([]);
  const cpsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load records from local storage
    try {
      const savedRecords = localStorage.getItem('mouseClickRecords');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  }, []);

  // CPS timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Test end
            if (interval) clearInterval(interval);
            setIsActive(false);
            
            // Calculate final CPS
            const finalCps = clicks / 10;
            setCps(Math.round(finalCps * 10) / 10);
            
            // Save record
            const newRecord = {
              cps: Math.round(finalCps * 10) / 10,
              clicks: clicks,
              date: new Date().toLocaleString()
            };
            
            const updatedRecords = [...records, newRecord].slice(-5); // Keep only the last 5 records
            setRecords(updatedRecords);
            try {
              localStorage.setItem('mouseClickRecords', JSON.stringify(updatedRecords));
            } catch (error) {
              console.error('Failed to save record:', error);
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

  // Using sliding window to calculate real-time CPS
  useEffect(() => {
    if (isActive) {
      // Initialize start time
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        clickTimesRef.current = [];
      }
      
      // Create a timer for calculating CPS
      cpsIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = (now - startTimeRef.current) / 1000;
        
        // Keep only clicks within the last 1 second
        clickTimesRef.current = clickTimesRef.current.filter(time => now - time <= 1000);
        
        // Calculate current clicks per second (based on the last 1 second sliding window)
        const currentWindowCps = clickTimesRef.current.length;
        
        // Calculate overall average CPS
        const overallCps = elapsedSeconds > 0 ? clicks / elapsedSeconds : 0;
        
        // Take the more reasonable value from sliding window and overall average
        const calculatedCps = Math.max(
          Math.min(currentWindowCps, clicks), // Prevent CPS from being too high due to sliding window
          elapsedSeconds >= 1 ? overallCps : 0 // Only consider overall average after at least 1 second
        );
        
        // Update CPS, keeping one decimal place
        const roundedCps = Math.round(calculatedCps * 10) / 10;
        setCps(roundedCps);
        
        // Update maximum CPS
        if (roundedCps > maxCps) {
          setMaxCps(roundedCps);
        }
      }, 100);
    } else {
      // Stop CPS calculation
      if (cpsIntervalRef.current) {
        clearInterval(cpsIntervalRef.current);
        cpsIntervalRef.current = null;
      }
      
      // Reset start time
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

  // Click handler
  const handleClick = () => {
    if (!isActive && timeLeft === 10) {
      // Start test
      setIsActive(true);
      setClicks(1);
      setCps(0);
      setMaxCps(0);
      startTimeRef.current = Date.now();
      clickTimesRef.current = [Date.now()];
    } else if (isActive) {
      // Record click time and increase count
      clickTimesRef.current.push(Date.now());
      setClicks(clicks + 1);
    }
  };

  // Reset function
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Mouse Click Counter Test</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test your mouse click speed and check clicks per second (CPS)
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Clicks</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{clicks}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Clicks Per Second</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{cps}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Max CPS</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{maxCps}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Time Left</div>
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
            {!isActive && timeLeft === 10 ? 'Click to Start Test' : isActive ? 'Click Here Quickly!' : 'Test Completed'}
          </button>
          
          {timeLeft === 0 && (
            <button
              onClick={resetTest}
              className="w-full py-3 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
            >
              Test Again
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Test Records</h2>
        {records.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Date</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-300">Clicks</th>
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
          <p className="text-gray-500 dark:text-gray-400 text-center">No test records</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Need to test other hardware?</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/mouse-double-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Mouse Double Click Test
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