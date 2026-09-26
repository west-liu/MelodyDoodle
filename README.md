# 🎹 MelodyDoodle · 旋律涂鸦

> **Create music with zero music background — just doodle, it sounds great automatically.**
>
> 零音乐基础也能创作音乐 — 随便弹，自动变好听

<p align="center">
  <a href="#-live-demo"><strong>✨ Live Demo</strong></a> ·
  <a href="#-features"><strong>🎯 Features</strong></a> ·
  <a href="#-quick-start"><strong>🚀 Quick Start</strong></a> ·
  <a href="#-architecture"><strong>🏗 Architecture</strong></a> ·
  <a href="#-story"><strong>📖 Story</strong></a>
  <br><br>
  <a href="#中文"><strong>🇨🇳 中文文档</strong></a> ·
  <a href="#english"><strong>🇬🇧 English</strong></a>
</p>

---

## English

### ✨ Live Demo

👉 **[Try it now](https://west-liu.github.io/MelodyDoodle/demo/)**

Open and play — no downloads needed.

### 🎯 Features

| | Feature | Description |
|---|---------|-------------|
| 🎵 | **Doodle sounds good** | Smart quantization algorithm aligns your random notes to the beat |
| 🎹 | **6 chord progressions** | Pop, Jazz, Blues, Minor… various styles |
| 🥁 | **Drum backing track** | Kick + snare + hi-hat, play along with the rhythm |
| 🤖 | **AI fun scoring** | Rhythm / Creativity / Harmony, 3D scoring + witty comments |
| 🏆 | **Achievement system** | 8 badges to unlock your musical talent |
| 📸 | **Share cards** | Generate beautiful images to share on social media |
| ⚡ | **Pure frontend** | Open HTML and play — no backend, no installation |
| 🔧 | **C++ core engine** | Professional MIDI processing, compilable to WASM for high performance |

### 🚀 Quick Start

#### Option 1: Open directly (simplest)

```bash
# Just double-click
demo/index.html
```

#### Option 2: Local server (recommended)

```bash
# Python
cd demo
python -m http.server 8080

# Node.js
npx serve demo
```

Then open `http://localhost:8080` in your browser.

#### Option 3: Deploy to GitHub Pages

Fork this repo, go to Settings → Pages, select `main` branch / root directory. It'll be live in 1 minute.

### 🎮 How to play

1. **Pick a style** — Pop Classic or Minor Sad
2. **Hit play** — 2-second countdown, then the backing track starts
3. **Doodle freely** — Play whatever you want, no right or wrong
4. **Hear your work** — Your melody + auto accompaniment = a complete song
5. **Check your score** — AI rates you, gives comments, unlocks achievements
6. **Share it** — Generate a share card and post it

### 🏗 Architecture

```
┌──────────────────────────────────────────────────────┐
│              Frontend Demo (JavaScript)               │
│  Piano · Recording · Quantization · Scoring · Game    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              C++ Core Engine (MidiEditer)             │
│  Quantize · Clean · Prolong · Velocity · Chords       │
│  Compiles to WASM / Android / iOS / Linux / Windows   │
└──────────────────────────────────────────────────────┘
```

- **Frontend**: Pure JS, zero dependencies, open and play
- **Engine**: Professional MIDI processing engine in C++, based on midifile library
- **Synthesis**: JZZ.js (browser) / FluidSynth (server)

🔧 **C++ Engine** → [MidiEditer](https://github.com/west-liu/MidiEditer) — Quantization · Deduplication · Prolongation · Velocity

Full architecture docs → [docs/architecture.md](docs/architecture.md)

### 📖 Story

This is a startup project from 2 years ago.

Back then we wanted to build a product that lets people with no music background create music — there was an APP, hardware, and offline interactive installations. We put a lot of time and energy into it.

The project didn't work out in the end, but the core technology is solid. Now I'm open-sourcing it, hoping more people can experience the joy of creating music.

Tech stack:
- Frontend: JavaScript + JZZ.js
- Backend: Python Flask
- Core engine: C++ (MidiEditer)
- Audio synthesis: FluidSynth + SoundFont

### 📁 Project Structure

```
MelodyDoodle/
├── demo/                  # Frontend demo (out of the box)
│   ├── index.html         # Home page
│   ├── piano.html         # Piano page
│   ├── js/
│   │   ├── index.js       # Piano core + quantization
│   │   └── game.js        # Gamification (scoring/comments/achievements/share)
│   └── css/
│       └── neon.css       # Neon visual style
│
├── engine/
│   └── cpp/               # C++ core engine MidiEditer
│       ├── include/       # Headers
│       ├── src/           # Source files
│       ├── test/          # Test programs
│       └── sample/        # Sample MIDI files
│
├── docs/
│   └── architecture.md    # Full architecture docs
│
├── start.bat              # Windows one-click start
└── README.md
```

### 🤝 Contributing

Issues and PRs are welcome!

- Found a bug? Open an issue
- Got an idea? Send a PR
- Think it's fun? ⭐ Star to support me

### 📄 License

MIT License

---

## 中文

### ✨ 在线体验

👉 **[点击立即体验](https://west-liu.github.io/MelodyDoodle/demo/)**

打开就能玩，不需要下载任何东西。

### 🎯 特性

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

### 🚀 快速开始

#### 方式一：直接打开（最简单）

```bash
# 直接双击打开
demo/index.html
```

#### 方式二：本地服务器（推荐）

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

#### 方式三：部署到 GitHub Pages

Fork 本仓库，在 Settings → Pages 里选择 `main` 分支的根目录，1分钟后就能在线访问。

### 🎮 怎么玩

1. **选个风格** — 流行经典 or 小调忧伤
2. **点播放** — 2秒准备，然后和弦伴奏开始
3. **随便弹** — 想弹什么弹什么，不用管对错
4. **听作品** — 你的旋律 + 自动伴奏，就是一首歌
5. **看评分** — AI给你打分、点评、解锁成就
6. **分享出去** — 生成卡片，发朋友圈

### 🏗 架构

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

### 📖 背后的故事

这是一个2年前的创业项目。

那时候我们想做一个"让不会音乐的人也能创作音乐"的产品——有APP、有硬件、有线下互动装置，投了很多时间和精力。

项目最后没做起来，但核心技术是完整的。现在我把它整理出来开源，希望能让更多人体验到"创作音乐"的快乐。

技术栈：
- 前端：JavaScript + JZZ.js
- 后端：Python Flask
- 核心引擎：C++（MidiEditer）
- 音频合成：FluidSynth + SoundFont

### 📁 项目结构

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

### 🤝 贡献

欢迎提 Issue 和 PR！

- 发现bug？提个Issue
- 有新想法？提个PR
- 觉得好玩？⭐ Star 一下支持我

### 📄 License

MIT License

---

<p align="center">
  Made with ❤️ by west
</p>
