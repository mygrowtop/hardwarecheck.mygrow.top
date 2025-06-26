import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hardware Testing Tools - Sitemap</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      margin-bottom: 20px;
      text-align: center;
    }
    .sitemap-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background-color: #f9fafb;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 10px;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .description {
      font-size: 0.9em;
      color: #666;
      margin-top: 4px;
    }
    .back-home {
      display: block;
      text-align: center;
      margin-top: 30px;
      padding: 10px;
      background-color: #2563eb;
      color: white;
      border-radius: 4px;
      font-weight: bold;
    }
    .back-home:hover {
      background-color: #1d4ed8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <h1>Hardware Testing Tools - Sitemap</h1>
  
  <div class="sitemap-container">
    <ul>
      <li>
        <a href="/">Home</a>
        <div class="description">Main page of hardware testing tools with various testing options.</div>
      </li>
      <li>
        <a href="/mouse-click">Mouse Click Test</a>
        <div class="description">Test your mouse click speed and button functionality.</div>
      </li>
      <li>
        <a href="/mouse-double-click">Mouse Double Click Test</a>
        <div class="description">Check your mouse double click function and response time.</div>
      </li>
      <li>
        <a href="/mouse-move">Mouse Movement Test</a>
        <div class="description">Test mouse movement trajectory and sensitivity.</div>
      </li>
      <li>
        <a href="/keyboard">Keyboard Test</a>
        <div class="description">Check if all keyboard keys are working properly.</div>
      </li>
      <li>
        <a href="/keyboard-double">Keyboard Double Press Test</a>
        <div class="description">Test keyboard key press speed and response.</div>
      </li>
      <li>
        <a href="/audio">Audio Test</a>
        <div class="description">Test headphone/speaker left-right channels and audio quality.</div>
      </li>
      <li>
        <a href="/microphone">Microphone Test</a>
        <div class="description">Test microphone recording and volume levels.</div>
      </li>
      <li>
        <a href="/display">Display Test</a>
        <div class="description">Test monitor color, resolution and refresh rate.</div>
      </li>
    </ul>
  </div>
  
  <a href="/" class="back-home">Back to Home</a>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}

export const dynamic = 'force-static'; 