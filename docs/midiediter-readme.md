# 🎹 MidiEditer · C++ MIDI Quantization Engine

> A professional C++ library for real-time MIDI editing — quantization, deduplication, prolongation, and velocity adjustment.
>
> C++ MIDI 量化引擎 — 实时处理乱弹的 MIDI 数据，让即兴旋律自动变好听

<p align="center">
  <a href="https://github.com/west-liu/MelodyDoodle"><strong>🎹 Live Demo (MelodyDoodle)</strong></a> ·
  <a href="#-features"><strong>🎯 Features</strong></a> ·
  <a href="#-algorithm"><strong>🔧 Algorithm</strong></a> ·
  <a href="#-build"><strong>🏗 Build</strong></a> ·
  <a href="#-credits"><strong>📜 Credits</strong></a>
</p>

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 🎵 **Quantization** | Aligns note-on timing to the nearest beat grid (8th/16th/32nd note) |
| 🧹 **Deduplication** | Removes overlapping notes within the same beat block, keeps passing tones |
| ⏳ **Prolongation** | Extends note-off to the end of the current beat grid |
| 🔊 **Velocity Quantization** | Adjusts note velocity for consistent dynamics |
| 🎹 **Chord-aware** | Works with any chord progression, removes chord-outside notes |
| ⚡ **Real-time** | Designed for live MIDI input from keyboard, web frontend, or hardware |

## 🔧 Algorithm

### Before → After (可视化对比)

```
Input: 乱弹的 MIDI (user doodling freely)
  ●    ● ●  ●●  ●     ●●●    ●  ●  ← 不规则节奏
  C  E F G  AA  C    EFG    A  C

         ↓ MidiEditer 量化处理 ↓

Output: 量化后的 MIDI (aligned to beat grid)
  ●    ●   ●   ●    ●     ●     ●   ●  ← 对齐到八分音符网格
  C    E   F   G    A    C      E   C
```

### 核心函数

```cpp
// 量化：对齐音头时间到最近的节拍网格
void QuantifyTrack(int track);

// 去重：移除同一区块内的重音，保留经过音
void CleanRecurNotes(int track);

// 延音：延长音尾到当前网格结束
void ProlongNotes(int track);

// 力度量化：统一音头音量
void QualifyVol(int track);

// 和弦外音剔除：根据和弦进行移除不在和弦内的音
void CleanChordVoiceover(int track);
```

### 数据流

```
User Input (keyboard/web/hardware)
        │
        ▼
   Raw MIDI Events
   (note_on/note_off with timestamps)
        │
        ▼
  ┌─────────────────────────┐
  │      MidiEditer          │
  │  1. QuantifyTrack        │  ← 量化到节拍网格
  │  2. CleanRecurNotes      │  ← 去重
  │  3. ProlongNotes         │  ← 延音补满
  │  4. QualifyVol           │  ← 力度调整
  │  5. CleanChordVoiceover  │  ← 和弦外音剔除
  └─────────────────────────┘
        │
        ▼
   Processed MIDI File
   (sounds good automatically)
```

## 🏗 Build

### 依赖

- C++11 or later
- Make
- [midifile](https://github.com/craigsapp/midifile) library (included in `include/`)

### 编译

```bash
# 编译库
make -f Makefile.library

# 编译测试程序
make -f Makefile.programs

# 运行测试
./midiediter input.mid output.mid
```

### 示例文件

```
sample/
├── melody_origin_1650441990.mid    ← 原始乱弹数据
├── melody_output_51546.mid          ← 量化处理后输出
├── QuantifyTrack/                   ← 量化测试用例
└── CleanRecureNotes/                ← 去重测试用例
```

## 🎮 在线体验

MidiEditer 的纯前端演示版本已上线：

**[🎹 MelodyDoodle Live Demo](https://west-liu.github.io/MelodyDoodle/demo/)**

打开浏览器就能体验：随便弹 → AI 自动量化 → 打分 + 点评

> 注意：在线版使用 JavaScript 简化版量化（仅八分音符网格），完整功能见 C++ 引擎。

## 📜 Credits

### midifile 库

本项目基于 [midifile](https://github.com/craigsapp/midifile) 库开发。

- **Author**: Craig Stuart Sapp
- **Institution**: Center for Computer Assisted Research in the Humanities (CCARL), Stanford University
- **License**: BSD-3-Clause
- **Repository**: https://github.com/craigsapp/midifile

midifile 是一个用于读写 Standard MIDI Files 的 C++ 类库，提供了 `MidiFile`、`MidiEvent`、`MidiMessage` 等核心类。MidiEditer 在此基础上增加了实时编辑和量化处理功能。

### 其他参考

- [MGenner](https://github.com/sinriv/mgenner) — 在线 MIDI 编辑器（Emscripten + WASM），项目中参考了其前端 MIDI 可视化方案
- [jmidifile](https://github.com/west-liu) — Java MIDI 读写库（Android 端使用，未单独开源）

## 📄 License

Licensed under either of

- Apache License, Version 2.0 ([LICENSE-APACHE](./LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](./LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

## 📖 Story

This engine was originally built for a music startup project (2021-2022).

The goal was: let people with zero music background create music by just doodling on a piano — the engine handles all the technical work (quantization, deduplication, prolongation) to make it sound good.

The project included:
- **APP** (Android, not open-sourced)
- **Hardware** (interactive installations, not open-sourced)
- **Web frontend** (→ evolved into [MelodyDoodle](https://github.com/west-liu/MelodyDoodle))
- **C++ Engine** (→ this repository)

The startup didn't work out, but the core technology is solid. Now open-sourced for anyone interested in MIDI processing and music algorithms.
