'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Script from "next/script";

export default function Home() {
  const hardwareChecks = [
    { name: "Mouse Click Counter", path: "/mouse-click", icon: "🖱️", description: "Test mouse click speed and count clicks per second (CPS). Identify potential issues with your mouse clicking mechanism." },
    { name: "Mouse Double Click Test", path: "/mouse-double-click", icon: "🖱️", description: "Diagnose double-click functionality and measure response interval. Perfect for testing gaming mice performance." },
    { name: "Mouse Movement Test", path: "/mouse-move", icon: "🖱️", description: "Analyze cursor movement smoothness and precision. Detect tracking issues and sensor performance problems." },
    { name: "Keyboard Counter Test", path: "/keyboard", icon: "⌨️", description: "Measure keyboard press speed and keys per second (KPS). Great for gamers and typing enthusiasts." },
    { name: "Keyboard Double Press Test", path: "/keyboard-double", icon: "⌨️", description: "Check for keyboard bounce issues and detect repeated input problems. Essential for mechanical keyboard testing." },
    { name: "Headphone Sound Test", path: "/audio", icon: "🎧", description: "Verify audio quality, channel balance and frequency response. Ensure your headphones deliver optimal sound." },
    { name: "Microphone Test", path: "/microphone", icon: "🎤", description: "Check microphone sensitivity, clarity and audio capture quality. Perfect for testing video call setup." },
    { name: "Display Test", path: "/display", icon: "🖥️", description: "Examine screen brightness, color accuracy, dead pixels and refresh rate. Comprehensive monitor diagnostics." },
  ];
  
  // ========= Mouse Click Counter Test =========
  const [clicks, setClicks] = useState<number>(0);
  const [cps, setCps] = useState<number>(0);
  const [maxCps, setMaxCps] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  
  const startTimeRef = useRef<number>(0);
  const clickTimesRef = useRef<number[]>([]);
  const cpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // CPS timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime: number) => {
          if (prevTime <= 1) {
            // Test end
            if (interval) clearInterval(interval);
            setIsActive(false);
            
            // Calculate final CPS
            const finalCps = clicks / 10;
            setCps(Math.round(finalCps * 10) / 10);
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, clicks]);
  
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
        clickTimesRef.current = clickTimesRef.current.filter((time: number) => now - time <= 1000);
        
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
  const resetClickTest = () => {
    setIsActive(false);
    setClicks(0);
    setCps(0);
    setMaxCps(0);
    setTimeLeft(10);
    startTimeRef.current = 0;
    clickTimesRef.current = [];
  };
  
  // ========= Mouse Double Click Test =========
  const [leftClicks, setLeftClicks] = useState<number>(0);
  const [rightClicks, setRightClicks] = useState<number>(0);
  const [leftDoubleClicks, setLeftDoubleClicks] = useState<number>(0);
  const [rightDoubleClicks, setRightDoubleClicks] = useState<number>(0);
  
  // Time interval setting (unit: milliseconds) - default is 80ms
  const [doubleClickInterval, setDoubleClickInterval] = useState<number>(80);
  
  // Double click detection
  const lastLeftClickRef = useRef<number>(0);
  const lastRightClickRef = useRef<number>(0);
  
  // Left/right click handler
  const handleLeftClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLeftClicks(leftClicks + 1);
    
    // Detect double click
    const now = Date.now();
    if (now - lastLeftClickRef.current <= doubleClickInterval) {
      setLeftDoubleClicks(leftDoubleClicks + 1);
    }
    lastLeftClickRef.current = now;
  };
  
  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setRightClicks(rightClicks + 1);
    
    // Detect double click
    const now = Date.now();
    if (now - lastRightClickRef.current <= doubleClickInterval) {
      setRightDoubleClicks(rightDoubleClicks + 1);
    }
    lastRightClickRef.current = now;
  };
  
  // Reset test
  const resetDoubleClickTest = () => {
    setLeftClicks(0);
    setRightClicks(0);
    setLeftDoubleClicks(0);
    setRightDoubleClicks(0);
    lastLeftClickRef.current = 0;
    lastRightClickRef.current = 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Add structured data for rich results */}
      <Script id="structured-data" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Hardware Testing Tools",
            "description": "Free online tools for testing computer hardware including mouse, keyboard, display, and audio devices",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          }
        `}
      </Script>
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Hardware Testing Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Free, comprehensive testing suite for your device performance. Diagnose issues with your mouse, keyboard, display, and audio devices with our easy-to-use online tools.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">8+</p>
            <p className="text-gray-600 dark:text-gray-300">Testing Tools</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">4</p>
            <p className="text-gray-600 dark:text-gray-300">Device Categories</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">5K+</p>
            <p className="text-gray-600 dark:text-gray-300">Satisfied Users</p>
          </div>
        </div>

        {/* Hardware testing tool cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Complete Testing Suite</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hardwareChecks.map((check) => (
              <Link 
                href={check.path} 
                key={check.path}
                className="block group h-full"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 h-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 flex flex-col">
                  <div className="flex items-center h-14 mb-2">
                    <span className="text-3xl mr-3">{check.icon}</span>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {check.name}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {check.description}
                  </p>
                  <div className="flex justify-end mt-auto">
                    <span className="text-blue-500 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform duration-200 text-sm">
                      Start Test →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Why Use Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Why Use Hardware Testing Tools?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Accurate Diagnostics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our testing tools provide precise measurements and detailed performance analysis to identify hardware issues before they become major problems.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">No Installation Needed</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access all testing tools directly in your browser without downloading or installing any software. Quick and convenient testing anytime, anywhere.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">User-Friendly Interface</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simple, intuitive controls make it easy for anyone to test their hardware, regardless of technical expertise. Clear results help you understand your device performance.
              </p>
            </div>
          </div>
        </section>
        
        {/* How to Use Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">How to Use Hardware Testing Tools</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl font-bold mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Select Test</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose the appropriate test for your hardware component from our complete testing suite.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl font-bold mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Start Testing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Follow the on-screen instructions to begin the test. Interact with your device as directed.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl font-bold mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">View Results</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Analyze the real-time data and performance metrics displayed during and after the test.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl font-bold mb-4">4</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Fix Issues</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use the diagnostic information to identify and resolve hardware problems or optimize performance.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Featured Test Categories</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4 text-center">🖱️</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white text-center">Mouse Tests</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive mouse diagnostics including click speed, double-click functionality, and movement precision tests.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4 text-center">⌨️</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white text-center">Keyboard Tests</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Key response tests, typing speed measurements, and key bounce detection for all keyboard types.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4 text-center">🎧</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white text-center">Audio Tests</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sound quality analysis, channel balance verification, and microphone sensitivity testing.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4 text-center">🖥️</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white text-center">Display Tests</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Screen calibration, dead pixel detection, and refresh rate verification for monitors and displays.
              </p>
            </div>
          </div>
        </section>
        
        {/* Test module area */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Tools</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mouse click counter test */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full">
              <div className="p-6 h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Mouse Click Counter</h2>
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
                  className={`w-full py-4 mb-4 text-xl font-bold rounded-lg transition-all flex-grow ${
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
                    onClick={resetClickTest}
                    className="w-full py-3 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
                  >
                    Test Again
                  </button>
                )}
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <a href="/mouse-click" className="text-blue-500 hover:underline">View full test details →</a>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mouse double click test */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full">
              <div className="p-6 h-full">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Mouse Double Click Test</h2>
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
                    className="w-full h-2 bg-green-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>50ms</span>
                    <span>500ms</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div 
                    className="bg-red-500 hover:bg-red-400 rounded-lg h-32 flex items-center justify-center cursor-pointer transition-colors duration-200"
                    onClick={handleLeftClick}
                    onContextMenu={handleRightClick}
                  >
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
                      </div>
                    </div>
                    <p className="absolute text-white font-medium">Left Click Test Area</p>
                  </div>
                  
                  <div 
                    className="bg-red-500 hover:bg-red-400 rounded-lg h-32 flex items-center justify-center cursor-pointer transition-colors duration-200"
                    onClick={handleLeftClick}
                    onContextMenu={handleRightClick}
                  >
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
                      </div>
                    </div>
                    <p className="absolute text-white font-medium">Right Click Test Area</p>
                  </div>
                </div>
                
                <button
                  onClick={resetDoubleClickTest}
                  className="w-full py-3 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all"
                >
                  Reset Test
                </button>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <a href="/mouse-double-click" className="text-blue-500 hover:underline">View full test details →</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">How accurate are these hardware tests?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our tests are designed to provide accurate measurements of your hardware performance within the constraints of browser-based testing. While they may not be as precise as specialized software, they offer reliable indicators of potential issues.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Why is my mouse click test showing lower CPS than expected?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  CPS (Clicks Per Second) can be affected by several factors including your mouse hardware, browser performance, and system resources. Try running the test in different browsers or after restarting your computer for more consistent results.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Can these tests help diagnose hardware failures?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, our tests can help identify many common hardware issues. For example, the double-click test can reveal when a mouse button is failing, and the keyboard test can identify sticky or unresponsive keys.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Do I need to install any software to use these tools?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No, all our hardware testing tools run directly in your web browser without requiring any downloads or installations. Simply visit the page for the test you want to run and follow the on-screen instructions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16 text-center">
          <div className="bg-blue-600 dark:bg-blue-700 p-10 rounded-xl shadow-md text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Test Your Hardware?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Select a test from our comprehensive suite and start diagnosing your hardware performance today.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="/mouse-click" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-all">
                Start Testing Now
              </a>
              <a href="/about" className="border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition-all">
                Learn More
              </a>
            </div>
          </div>
        </section>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Professional Hardware Testing Tools | Test Your Device Performance Anytime, Anywhere
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last Updated: June 2025 | <a href="/blog" className="text-blue-500 hover:underline">Read our hardware testing blog</a>
          </p>
        </div>
      </main>
    </div>
  );
}
