# 硬件检测工具 (Hardware Check)

一个用于检测电脑硬件性能的在线工具网站，帮助用户快速测试和诊断硬件问题。

## 功能特点

- **鼠标连击检测**：测试鼠标按键响应速度和连击能力
- **鼠标滑动检测**：测试鼠标移动的平滑度和精确度
- **键盘连击检测**：测试键盘按键的响应速度
- **耳机声音检测**：测试耳机的音质和平衡性
- **麦克风检测**：测试麦克风输入质量和灵敏度
- **屏幕检测**：测试显示器的分辨率、色彩和刷新率

## 技术架构

- 框架：Next.js 14
- 样式：TailwindCSS
- 语言：TypeScript
- 浏览器API：Web Audio API, Canvas API, Fullscreen API

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 部署

本项目可轻松部署到Cloudflare Pages等平台:

1. 推送代码到GitHub仓库
2. 在Cloudflare Pages中连接你的GitHub仓库
3. 设置构建命令为 `npm run build`
4. 设置输出目录为 `.next`

## 贡献指南

欢迎提交PR或提出Issue来改进这个项目。在提交PR之前，请确保:

1. 代码符合项目的编码规范
2. 新功能有适当的测试
3. 所有现有测试都能通过

## 许可证

MIT

## 预览

![硬件检测工具截图](screenshot.png)

## 联系方式

如有任何问题，请通过GitHub Issues联系我们。
