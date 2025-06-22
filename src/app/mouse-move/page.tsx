'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MouseMoveTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const [metrics, setMetrics] = useState({
    distance: 0,
    speed: 0,
    smoothness: 0,
    accuracy: 0
  });
  
  // Draw mouse trajectory
  useEffect(() => {
    if (!canvasRef.current || points.length < 2) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to its display size
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw trajectory
    ctx.strokeStyle = '#3b82f6'; // blue-500
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    
    // Draw start and end points
    if (points.length > 1) {
      // Start point (green)
      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // End point (red)
      ctx.fillStyle = '#ef4444'; // red-500
      ctx.beginPath();
      ctx.arc(points[points.length - 1].x, points[points.length - 1].y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [points]);
  
  // Calculate metrics
  useEffect(() => {
    if (points.length < 2) return;
    
    // Calculate total distance
    let totalDistance = 0;
    let angles: number[] = [];
    
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      totalDistance += Math.sqrt(dx*dx + dy*dy);
      
      // Calculate angle changes (for smoothness)
      if (i > 1) {
        const prevDx = points[i-1].x - points[i-2].x;
        const prevDy = points[i-1].y - points[i-2].y;
        
        // Calculate angle between two vectors
        const dot = prevDx * dx + prevDy * dy;
        const prevMag = Math.sqrt(prevDx*prevDx + prevDy*prevDy);
        const curMag = Math.sqrt(dx*dx + dy*dy);
        
        if (prevMag > 0 && curMag > 0) {
          const cosTheta = dot / (prevMag * curMag);
          const angle = Math.acos(Math.min(1, Math.max(-1, cosTheta)));
          angles.push(angle);
        }
      }
    }
    
    // Calculate speed (pixels/second)
    const timeTaken = points.length > 0 ? points.length / 60 : 1; // Assume 60Hz
    const speed = totalDistance / timeTaken;
    
    // Calculate smoothness (consistency of angle changes)
    let smoothness = 0;
    if (angles.length > 0) {
      const avgAngle = angles.reduce((sum, a) => sum + a, 0) / angles.length;
      const angleVariance = angles.reduce((sum, a) => sum + Math.pow(a - avgAngle, 2), 0) / angles.length;
      // Higher smoothness means lower variance
      smoothness = Math.max(0, 100 - (angleVariance * 100));
    }
    
    // Calculate accuracy (improved version)
    let accuracy = 0;
    if (points.length > 2) {
      // Calculate straight-line distance from start to end
      const startPoint = points[0];
      const endPoint = points[points.length - 1];
      const directDistance = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + 
        Math.pow(endPoint.y - startPoint.y, 2)
      );
      
      // Calculate actual path distance between each point
      let pathDistance = 0;
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        pathDistance += Math.sqrt(dx*dx + dy*dy);
      }
      
      // Calculate path efficiency (direct distance/actual path distance)
      const pathEfficiency = directDistance > 0 ? directDistance / pathDistance : 0;
      
      // Calculate accuracy - combining path efficiency and point distribution stability
      // Calculate variance of points from the straight line
      const startToEnd = {
        x: endPoint.x - startPoint.x,
        y: endPoint.y - startPoint.y
      };
      const lineLength = Math.sqrt(startToEnd.x * startToEnd.x + startToEnd.y * startToEnd.y);
      
      if (lineLength > 0) {
        // Get distance of each point to the line
        let deviations: number[] = [];
        for (let i = 1; i < points.length - 1; i++) {
          // Distance from point to line
          const point = points[i];
          const deviation = Math.abs(
            (endPoint.y - startPoint.y) * point.x - 
            (endPoint.x - startPoint.x) * point.y + 
            endPoint.x * startPoint.y - 
            endPoint.y * startPoint.x
          ) / lineLength;
          
          deviations.push(deviation);
        }
        
        // Calculate average deviation
        const avgDeviation = deviations.length > 0 
          ? deviations.reduce((sum, d) => sum + d, 0) / deviations.length
          : 0;
        
        // Calculate deviation consistency
        const deviationConsistency = deviations.length > 0
          ? 1 - Math.min(1, deviations.reduce((sum, d) => sum + Math.abs(d - avgDeviation), 0) / (deviations.length * 50))
          : 1;
        
        // Calculate final accuracy, combining path efficiency and consistency
        accuracy = Math.round(
          (pathEfficiency * 60) + // Path efficiency weight 60%
          (deviationConsistency * 40) // Trajectory consistency weight 40%
        );
        
        // Ensure value is in range 0-100
        accuracy = Math.max(0, Math.min(100, accuracy));
      }
    }
    
    setMetrics({
      distance: Math.round(totalDistance),
      speed: Math.round(speed),
      smoothness: Math.round(smoothness),
      accuracy: Math.round(accuracy)
    });
  }, [points]);
  
  // Mouse move event handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isTracking || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPoints(prev => [...prev, {x, y}]);
  };
  
  const startTracking = () => {
    setIsTracking(true);
    setPoints([]);
    setMetrics({
      distance: 0,
      speed: 0,
      smoothness: 0,
      accuracy: 0
    });
  };
  
  const stopTracking = () => {
    setIsTracking(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Mouse Movement Test</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test your mouse movement smoothness and precision
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Instructions</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              1. Click the "Start Test" button
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              2. Try to draw some shapes (straight lines, circles, or others) in the area below
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              3. After completing the test, click "Stop Test" to view your mouse performance metrics
            </p>
          </div>
          
          <div className="flex space-x-4 mb-4">
            <button
              onClick={startTracking}
              disabled={isTracking}
              className={`px-4 py-2 rounded-lg font-medium ${
                isTracking ? 
                'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' : 
                'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Start Test
            </button>
            <button
              onClick={stopTracking}
              disabled={!isTracking}
              className={`px-4 py-2 rounded-lg font-medium ${
                !isTracking ? 
                'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' : 
                'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Stop Test
            </button>
          </div>
          
          <div 
            className="relative bg-gray-100 dark:bg-gray-700 rounded-lg mb-6"
            style={{height: '300px'}}
          >
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              className="absolute inset-0 w-full h-full cursor-crosshair"
            />
            {!isTracking && points.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Click "Start Test" and move your mouse in this area
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Distance</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.distance} px</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Speed</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.speed} px/s</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Smoothness</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.smoothness}%</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.accuracy}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-4 mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Metrics Explanation</h3>
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-left">
              <p className="font-medium text-gray-700 dark:text-gray-300">Distance</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total pixel distance of mouse movement</p>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-700 dark:text-gray-300">Speed</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Average speed of mouse movement (pixels/second)</p>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-700 dark:text-gray-300">Smoothness</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Smoothness of mouse movement trajectory, higher is smoother</p>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-700 dark:text-gray-300">Accuracy</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Path efficiency and stability of mouse movement, higher is more precise</p>
            </div>
          </div>
        </div>
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
            href="/mouse-double-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Mouse Double Click Test
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