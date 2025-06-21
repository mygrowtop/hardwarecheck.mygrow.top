# 硬件检测工具

这是一个用于检测计算机硬件性能的Web应用程序。它提供了多种检测工具，包括耳机声音检测、麦克风检测、屏幕检测等功能。

## 功能特点

- **耳机声音检测**：测试左右声道、平衡和频率响应
- **麦克风检测**：测试麦克风音量和频率响应
- **屏幕检测**：测试屏幕显示质量、坏点和响应速度
- **鼠标连击检测**：测试鼠标连击速度和稳定性
- **鼠标滑动检测**：测试鼠标移动平滑度
- **键盘连击检测**：测试键盘按键响应速度

## 技术栈

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS

## 本地开发

1. 克隆仓库

```bash
git clone https://github.com/yourusername/hardware-check.git
cd hardware-check
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 打开浏览器访问 http://localhost:3000

## 构建和部署

### 构建静态文件

```bash
npm run build
```

### 部署到Cloudflare Pages

1. 安装Wrangler CLI (Cloudflare的命令行工具)

```bash
npm install -g wrangler
```

2. 登录Cloudflare账户

```bash
wrangler login
```

3. 创建Pages项目

在Cloudflare Dashboard中:
- 进入Pages
- 点击"创建应用程序"
- 连接您的GitHub仓库
- 设置构建配置:
  - 构建命令: `npm run build`
  - 输出目录: `out`
  - 环境变量: 根据需要添加

4. 部署设置

- **构建命令**: `npm run build`
- **输出目录**: `out`
- **框架预设**: Next.js
- **环境变量**: 根据需要添加

5. 高级设置

- 确保在构建设置中启用了"静态站点"选项
- 如果需要，配置自定义域名

## 注意事项

- 本应用使用了Web Audio API，需要现代浏览器支持
- 部分功能需要用户授予麦克风等权限
- 建议使用Chrome、Firefox或Edge浏览器获得最佳体验

## 许可证

MIT

## 预览

![硬件检测工具截图](screenshot.png)

## 联系方式

如有任何问题，请通过GitHub Issues联系我们。
