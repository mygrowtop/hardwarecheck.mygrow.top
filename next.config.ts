import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // 静态导出
  distDir: 'out',    // 输出目录
  images: {
    unoptimized: true, // Cloudflare Pages不支持Next.js的图像优化
  },
  trailingSlash: true, // 添加尾部斜杠，有助于部署到CDN
  eslint: {
    ignoreDuringBuilds: true, // 构建时忽略ESLint错误
  },
  typescript: {
    ignoreBuildErrors: true, // 构建时忽略TypeScript错误
  },
};

export default nextConfig;
