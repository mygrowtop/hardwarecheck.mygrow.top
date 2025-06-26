import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 从静态文件中读取内容
    const filePath = path.join(process.cwd(), 'public', 'static', 'sitemap.xml');
    const fileContent = readFileSync(filePath, 'utf8');
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    return new NextResponse(`Error serving sitemap: ${error}`, { status: 500 });
  }
}

export const dynamic = 'force-static'; 