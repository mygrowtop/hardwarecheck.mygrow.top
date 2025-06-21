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
  
  // 绘制鼠标轨迹
  useEffect(() => {
    if (!canvasRef.current || points.length < 2) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置canvas尺寸为其显示尺寸
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制轨迹
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
    
    // 绘制起点和终点
    if (points.length > 1) {
      // 起点（绿色）
      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // 终点（红色）
      ctx.fillStyle = '#ef4444'; // red-500
      ctx.beginPath();
      ctx.arc(points[points.length - 1].x, points[points.length - 1].y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [points]);
  
  // 计算指标
  useEffect(() => {
    if (points.length < 2) return;
    
    // 计算总距离
    let totalDistance = 0;
    let angles: number[] = [];
    
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      totalDistance += Math.sqrt(dx*dx + dy*dy);
      
      // 计算角度变化（用于平滑度）
      if (i > 1) {
        const prevDx = points[i-1].x - points[i-2].x;
        const prevDy = points[i-1].y - points[i-2].y;
        
        // 计算两个向量间的角度
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
    
    // 计算速度（像素/秒）
    const timeTaken = points.length > 0 ? points.length / 60 : 1; // 假设60Hz
    const speed = totalDistance / timeTaken;
    
    // 计算平滑度（角度变化的一致性）
    let smoothness = 0;
    if (angles.length > 0) {
      const avgAngle = angles.reduce((sum, a) => sum + a, 0) / angles.length;
      const angleVariance = angles.reduce((sum, a) => sum + Math.pow(a - avgAngle, 2), 0) / angles.length;
      // 平滑度越高，方差越小
      smoothness = Math.max(0, 100 - (angleVariance * 100));
    }
    
    // 计算准确度（改进版）
    let accuracy = 0;
    if (points.length > 2) {
      // 计算起点到终点的直线距离
      const startPoint = points[0];
      const endPoint = points[points.length - 1];
      const directDistance = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + 
        Math.pow(endPoint.y - startPoint.y, 2)
      );
      
      // 计算每个点之间的实际路径距离
      let pathDistance = 0;
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        pathDistance += Math.sqrt(dx*dx + dy*dy);
      }
      
      // 计算路径效率 (直线距离/实际路径距离)
      const pathEfficiency = directDistance > 0 ? directDistance / pathDistance : 0;
      
      // 计算准确度 - 结合路径效率和点的分布稳定性
      // 计算点到直线的方差
      const startToEnd = {
        x: endPoint.x - startPoint.x,
        y: endPoint.y - startPoint.y
      };
      const lineLength = Math.sqrt(startToEnd.x * startToEnd.x + startToEnd.y * startToEnd.y);
      
      if (lineLength > 0) {
        // 获取每个点到直线的距离
        let deviations: number[] = [];
        for (let i = 1; i < points.length - 1; i++) {
          // 点到直线的距离
          const point = points[i];
          const deviation = Math.abs(
            (endPoint.y - startPoint.y) * point.x - 
            (endPoint.x - startPoint.x) * point.y + 
            endPoint.x * startPoint.y - 
            endPoint.y * startPoint.x
          ) / lineLength;
          
          deviations.push(deviation);
        }
        
        // 计算偏差的平均值
        const avgDeviation = deviations.length > 0 
          ? deviations.reduce((sum, d) => sum + d, 0) / deviations.length
          : 0;
        
        // 计算偏差的一致性
        const deviationConsistency = deviations.length > 0
          ? 1 - Math.min(1, deviations.reduce((sum, d) => sum + Math.abs(d - avgDeviation), 0) / (deviations.length * 50))
          : 1;
        
        // 计算最终准确度，结合路径效率和一致性
        accuracy = Math.round(
          (pathEfficiency * 60) + // 路径效率占比60%
          (deviationConsistency * 40) // 轨迹一致性占比40%
        );
        
        // 确保值在0-100范围内
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
  
  // 鼠标移动事件处理
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">鼠标滑动检测</h1>
        <p className="text-gray-600 dark:text-gray-300">
          测试鼠标移动的平滑度和精确度
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">操作说明</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              1. 点击"开始测试"按钮
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              2. 在下面的区域尝试绘制一些图形（直线、圆形或其他）
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              3. 测试完成后点击"停止测试"，查看您的鼠标性能指标
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
              开始测试
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
              停止测试
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
                点击"开始测试"并在此区域移动鼠标
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">移动距离</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.distance} px</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">移动速度</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.speed} px/s</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">平滑度</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.smoothness}%</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">准确度</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.accuracy}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-4 mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">指标说明</h3>
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-left">
              <p className="font-medium text-gray-700 dark:text-gray-300">移动距离</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">鼠标移动的总像素距离</p>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-700 dark:text-gray-300">移动速度</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">鼠标移动的平均速度(像素/秒)</p>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-700 dark:text-gray-300">平滑度</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">鼠标移动轨迹的平滑程度，越高表示越平滑</p>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-700 dark:text-gray-300">准确度</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">鼠标移动的路径效率和稳定性，越高表示移动越精准</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">需要测试其他硬件吗？</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            href="/mouse-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            鼠标点击计数测试
          </Link>
          <Link 
            href="/mouse-double-click" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            鼠标双击测试
          </Link>
          <Link 
            href="/keyboard" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            键盘连击检测
          </Link>
        </div>
      </div>
    </div>
  );
} 