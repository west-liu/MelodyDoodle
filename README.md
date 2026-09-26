# 🎹 MelodyDoodle · 旋律涂鸦

> 零音乐基础也能创作音乐 — 随便弹，自动变好听

<p align="center">
  <a href="#-在线体验"><strong>✨ 在线体验</strong></a> ·
  <a href="#-快速开始"><strong>🚀 快速开始</strong></a> ·
  <a href="#-特性"><strong>🎯 特性</strong></a> ·
  <a href="#-架构"><strong>🏗 架构</strong></a> ·
  <a href="#-背后的故事"><strong>📖 故事</strong></a>
</p>

---

## ✨ 在线体验

👉 **[点击立即体验](https://west-liu.github.io/MelodyDoodle/demo/)**

打开就能玩，不需要下载任何东西。

---

## 🎯 特性

| | 功能 | 说明 |
|---|------|------|
| 🎵 | **随便弹也好听** | 智能量化算法，把你乱弹的音符对齐到节拍 |
| 🎹 | **6种和弦进行** | 流行、爵士、蓝调、小调…各种风格 |
| 🥁 | **鼓点伴奏** | 底鼓+军鼓+踩镲，跟着节奏弹更有感觉 |
| 🤖 | **AI 趣味评分** | 节奏感/创意度/和谐度，三维打分 + 毒舌点评 |
| 🏆 | **成就系统** | 8个成就徽章，解锁你的音乐天赋 |
| 📸 | **一键分享卡片** | 生成精美图片，发朋友圈装逼 |
| ⚡ | **纯前端** | 打开HTML就能玩，不需要后端、不需要安装 |
| 🔧 | **C++ 核心引擎** | 专业级MIDI处理，可编译为WASM高性能运行 |

---

## 🚀 快速开始

### 方式一：直接打开（最简单）

```bash
# 直接双击打开
demo/index.html
```

### 方式二：本地服务器（推荐）

```bash
# 方式1：Python
cd demo
python -m http.server 8080

# 方式2：Node.js
npx serve demo

# 方式3：Windows 双击
start.bat
```

然后浏览器打开 `http://localhost:8080`

### 方式三：部署到 GitHub Pages

Fork 本仓库，在 Settings → Pages 里选择 `main` 分支的根目录，1分钟后就能在线访问。

---

## 🎮 怎么玩

1. **选个风格** — 流行经典 or 小调忧伤
2. **点播放** — 2秒准备，然后和弦伴奏开始
3. **随便弹** — 想弹什么弹什么，不用管对错
4. **听作品** — 你的旋律 + 自动伴奏，就是一首歌
5. **看评分** — AI给你打分、点评、解锁成就
6. **分享出去** — 生成卡片，发朋友圈

---

## 🏗 架构

```
┌──────────────────────────────────────────────────────┐
│                   前端 Demo（JavaScript）             │
│  钢琴交互 · 录制 · 量化 · 评分 · 游戏化 · 分享        │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              C++ 核心引擎（MidiEditer）               │
│  量化 / 清理重复音 / 延音 / 力度 / 和弦配器            │
│  可编译为 WASM / Android / iOS / Linux / Windows      │
└──────────────────────────────────────────────────────┘
```

- **前端**：纯JS实现，零依赖，打开就玩
- **引擎**：C++写的专业MIDI处理引擎，基于midifile库
- **音频合成**：JZZ.js（浏览器）/ FluidSynth（服务端）

详细架构文档 → [docs/architecture.md](docs/architecture.md)

---

## 📖 背后的故事

这是一个2年前的创业项目。

那时候我们想做一个"让不会音乐的人也能创作音乐"的产品——有APP、有硬件、有线下互动装置，投了很多时间和精力。

项目最后没做起来，但核心技术是完整的。现在我把它整理出来开源，希望能让更多人体验到"创作音乐"的快乐。

技术栈：
- 前端：JavaScript + JZZ.js
- 后端：Python Flask
- 核心引擎：C++（MidiEditer）
- 音频合成：FluidSynth + SoundFont

---

## 📁 项目结构

```
MelodyDoodle/
├── demo/                  # 前端演示版（开箱即用）
│   ├── index.html         # 首页
│   ├── piano.html         # 钢琴页面
│   ├── js/
│   │   ├── index.js       # 钢琴核心 + 量化算法
│   │   └── game.js        # 游戏化（评分/点评/成就/分享）
│   └── css/
│       └── neon.css       # 霓虹视觉风格
│
├── engine/
│   └── cpp/               # C++ 核心引擎 MidiEditer
│       ├── include/       # 头文件
│       ├── src/           # 源文件
│       ├── test/          # 测试程序
│       └── sample/        # 示例 MIDI 文件
│
├── docs/
│   └── architecture.md    # 完整架构文档
│
├── start.bat              # Windows一键启动
└── README.md
```

---

## 🤝 贡献

欢迎提 Issue 和 PR！

- 发现bug？提个Issue
- 有新想法？提个PR
- 觉得好玩？⭐ Star 一下支持我

---

## 📄 License

MIT License

---

<p align="center">
  Made with ❤️ by west
</p>
