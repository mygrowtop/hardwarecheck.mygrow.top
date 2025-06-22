'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function DisplayTest() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    colorDepth: 0,
    pixelDepth: 0,
    refreshRate: 0,
  });
  const [deadPixelColor, setDeadPixelColor] = useState('#FFFFFF');
  const [countdown, setCountdown] = useState(5);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const requestIdRef = useRef<number>(0);
  const colorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get screen information
  useEffect(() => {
    setScreenInfo({
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      refreshRate: window.screen.height,
    });
    
    // Detect actual refresh rate
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      try {
        const video = document.createElement('video');
        const calculateRefreshRate = () => {
          const now = performance.now();
          const elapsed = now - lastTimeRef.current;
          
          if (lastTimeRef.current !== 0) {
            frameCountRef.current++;
            
            if (elapsed >= 1000) {
              const fps = Math.round((frameCountRef.current * 1000) / elapsed);
              setScreenInfo(prev => ({ ...prev, refreshRate: fps }));
              frameCountRef.current = 0;
              lastTimeRef.current = now;
            }
          } else {
            lastTimeRef.current = now;
          }
          
          // @ts-ignore (TypeScript may not recognize this API)
          requestIdRef.current = video.requestVideoFrameCallback(calculateRefreshRate);
        };
        
        // @ts-ignore
        requestIdRef.current = video.requestVideoFrameCallback(calculateRefreshRate);
        
        return () => {
          // @ts-ignore
          video.cancelVideoFrameCallback(requestIdRef.current);
        };
      } catch (err) {
        console.error('Failed to get refresh rate:', err);
      }
    }
  }, []);
  
  // Enter/exit fullscreen
  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (fullscreenRef.current && fullscreenRef.current.requestFullscreen) {
        fullscreenRef.current.requestFullscreen().then(() => {
          setFullscreen(true);
        }).catch(err => {
          console.error('Fullscreen mode failed:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setFullscreen(false);
        }).catch(err => {
          console.error('Exit fullscreen mode failed:', err);
        });
      }
    }
  };
  
  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Dead pixel test automatic color change
  useEffect(() => {
    // Clear previous timers
    if (colorIntervalRef.current) {
      clearInterval(colorIntervalRef.current);
      colorIntervalRef.current = null;
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (activeTest === 'deadPixels') {
      const colors = ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'];
      let colorIndex = 0;
      
      // Set initial color and countdown
      setDeadPixelColor(colors[colorIndex]);
      setCountdown(5);
      
      // Create countdown timer, update once per second
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 5; // Reset to 5 seconds
          }
          return prev - 1;
        });
      }, 1000);
      
      // Create new timer, switch color every 5 seconds
      colorIntervalRef.current = setInterval(() => {
        colorIndex = (colorIndex + 1) % colors.length;
        setDeadPixelColor(colors[colorIndex]);
        setCountdown(5); // Reset countdown
      }, 5000);
    }
    
    // Clean up timers when component unmounts or test changes
    return () => {
      if (colorIntervalRef.current) {
        clearInterval(colorIntervalRef.current);
        colorIntervalRef.current = null;
      }
      
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [activeTest]);
  
  const startTest = (testType: string) => {
    if (activeTest === testType) {
      setActiveTest(null);
      return;
    }
    
    setActiveTest(testType);
    
    if (testType === 'colors' || testType === 'gradients') {
      renderColorTest(testType);
    }
  };
  
  // Render color test
  const renderColorTest = (testType: string) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    if (testType === 'colors') {
      // Basic color test
      ctx.clearRect(0, 0, width, height);
      
      // Draw main color blocks
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#000000', '#FFFFFF', 
                      '#FFFF00', '#FF00FF', '#00FFFF', '#FF8000', '#8000FF'];
      
      const blockWidth = width / 5;
      const blockHeight = height / 2;
      
      for (let i = 0; i < colors.length; i++) {
        const x = (i % 5) * blockWidth;
        const y = Math.floor(i / 5) * blockHeight;
        
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, y, blockWidth, blockHeight);
        
        // Add color value label
        ctx.fillStyle = colors[i] === '#000000' ? '#FFFFFF' : '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(colors[i], x + blockWidth / 2, y + blockHeight / 2);
      }
    } else if (testType === 'gradients') {
      // Gradient test
      ctx.clearRect(0, 0, width, height);
      
      // Horizontal black-white gradient
      const bwGradient = ctx.createLinearGradient(0, 0, width, 0);
      bwGradient.addColorStop(0, 'black');
      bwGradient.addColorStop(1, 'white');
      ctx.fillStyle = bwGradient;
      ctx.fillRect(0, 0, width, height / 4);
      
      // RGB gradient
      const rgbGradient = ctx.createLinearGradient(0, 0, width, 0);
      rgbGradient.addColorStop(0, 'red');
      rgbGradient.addColorStop(0.33, 'green');
      rgbGradient.addColorStop(0.66, 'blue');
      rgbGradient.addColorStop(1, 'red');
      ctx.fillStyle = rgbGradient;
      ctx.fillRect(0, height / 4, width, height / 4);
      
      // Rainbow gradient
      const rainbowGradient = ctx.createLinearGradient(0, 0, width, 0);
      rainbowGradient.addColorStop(0, 'red');
      rainbowGradient.addColorStop(0.17, 'orange');
      rainbowGradient.addColorStop(0.33, 'yellow');
      rainbowGradient.addColorStop(0.5, 'green');
      rainbowGradient.addColorStop(0.67, 'blue');
      rainbowGradient.addColorStop(0.83, 'indigo');
      rainbowGradient.addColorStop(1, 'violet');
      ctx.fillStyle = rainbowGradient;
      ctx.fillRect(0, height / 2, width, height / 4);
      
      // Grayscale gradient
      const grayGradient = ctx.createLinearGradient(0, 0, width, 0);
      for (let i = 0; i <= 1; i += 0.1) {
        const grayValue = Math.floor(i * 255);
        const color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        grayGradient.addColorStop(i, color);
      }
      ctx.fillStyle = grayGradient;
      ctx.fillRect(0, height * 3/4, width, height / 4);
    }
  };
  
  // Adjust Canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        
        // If active test exists, re-render
        if (activeTest === 'colors' || activeTest === 'gradients') {
          renderColorTest(activeTest);
        }
      }
    };
    
    // Initial adjustment
    updateCanvasSize();
    
    // Adjust when window size changes
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [activeTest]);
  
  // Test options
  const tests = [
    { id: 'colors', name: 'Basic Color Test', description: 'Check if your screen displays all basic colors correctly' },
    { id: 'gradients', name: 'Gradient Test', description: 'Check if color transitions are smooth on your screen' },
    { id: 'deadPixels', name: 'Dead Pixel Test', description: 'Detect if your screen has dead or stuck pixels' },
    { id: 'response', name: 'Response Time Test', description: 'Test screen response time and motion blur' }
  ];
  
  // Get color name
  const getColorName = (color: string) => {
    switch(color) {
      case '#FFFFFF': return 'White';
      case '#000000': return 'Black';
      case '#FF0000': return 'Red';
      case '#00FF00': return 'Green';
      case '#0000FF': return 'Blue';
      default: return color;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Display Test</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test your screen display quality and performance
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row mb-6 gap-6">
            <div className="md:w-1/2">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Screen Information</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-300">Resolution</span>
                  <span className="font-medium text-gray-900 dark:text-white">{screenInfo.width} × {screenInfo.height}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-300">Color Depth</span>
                  <span className="font-medium text-gray-900 dark:text-white">{screenInfo.colorDepth} bit</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-300">Pixel Depth</span>
                  <span className="font-medium text-gray-900 dark:text-white">{screenInfo.pixelDepth} bit</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-300">Estimated Refresh Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">{screenInfo.refreshRate} Hz</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={toggleFullscreen}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                >
                  {fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Mode'}
                </button>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Test Instructions</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                  <li>Basic Color Test: Check if all colors display correctly without abnormalities</li>
                  <li>Gradient Test: Check if gradients are smooth with no visible banding</li>
                  <li>Dead Pixel Test: Carefully check for dead pixels in fullscreen mode</li>
                  <li>Response Time: Move your cursor to check for motion blur and delay</li>
                </ul>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Select Test</h2>
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
              
              <div 
                className="relative rounded-lg overflow-hidden" 
                style={{ height: '200px', backgroundColor: activeTest === 'deadPixels' ? deadPixelColor : '' }}
              >
                {(activeTest === 'colors' || activeTest === 'gradients') && (
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />
                )}
                
                {activeTest === 'response' && (
                  <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute w-20 h-20 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                      <div className="relative w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        Follow
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTest === 'deadPixels' && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                    Current: {getColorName(deadPixelColor)} ({countdown}s)
                  </div>
                )}
                
                {!activeTest && (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Select a test to begin
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fullscreen test area */}
      <div
        ref={fullscreenRef}
        className={`fixed inset-0 bg-white dark:bg-black z-50 ${fullscreen ? 'flex' : 'hidden'} flex-col items-center justify-center`}
      >
        {fullscreen && activeTest === 'deadPixels' && (
          <div className="w-full h-full" style={{ backgroundColor: deadPixelColor }}>
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
              Press ESC to exit fullscreen | Current: {getColorName(deadPixelColor)} ({countdown}s)
            </div>
          </div>
        )}
        
        {fullscreen && (activeTest === 'colors' || activeTest === 'gradients') && (
          <div className="w-full h-full">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />
            <div className="absolute top-4 right-4 bg-black/30 text-white px-3 py-1 rounded-lg text-sm">
              Press ESC to exit fullscreen
            </div>
          </div>
        )}
        
        {fullscreen && activeTest === 'response' && (
          <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center">
            <div className="relative">
              <div className="absolute w-32 h-32 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                Follow
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-black/30 text-white px-3 py-1 rounded-lg text-sm">
              Press ESC to exit fullscreen | Move cursor to check for motion blur
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Need to test other hardware?</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/mouse-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Mouse Click Test
          </Link>
          <Link 
            href="/keyboard" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Keyboard Test
          </Link>
        </div>
      </div>
    </div>
  );
} 