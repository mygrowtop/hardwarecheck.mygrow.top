import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // 静态导出
  images: {
    unoptimized: true, // Cloudflare Pages不支持Next.js的图像优化
  },
  trailingSlash: true, // 添加尾部斜杠，有助于部署到CDN
};

export default nextConfig;
