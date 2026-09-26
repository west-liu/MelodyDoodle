// ========== 游戏化功能：评分 + 点评 + 成就 + 分享卡片 ==========

// ===== 1. AI趣味评分系统 =====

function calculateScore(quantizedNotes, rawNotes, bpm, lightarr) {
    var beatMs = 60000 / bpm;
    var totalBeats = lightarr.length * 4;

    if (quantizedNotes.length === 0) {
        return { rhythm: 0, creativity: 0, harmony: 0, total: 0 };
    }

    // ---- 1. 节奏感评分 ----
    // 思路：原始音符和量化后音符的时间差越小，节奏感越好
    var totalOffset = 0;
    var noteCount = quantizedNotes.length;

    // 简单估算：把原始音符和量化后的音符做对比
    // 因为量化后是配对好的，我们用原始音符的起始时间和量化后的起始时间对比
    var rawNoteOns = rawNotes.filter(function(n) { return n.type === 'note_on'; });
    var avgOffset = 0;
    if (rawNoteOns.length > 0) {
        // 计算每个原始音符离最近量化网格的距离
        var unitMs = beatMs * 0.5; // 八分音符
        for (var i = 0; i < rawNoteOns.length; i++) {
            var time = rawNoteOns[i].time;
            var nearestGrid = Math.round(time / unitMs) * unitMs;
            var offset = Math.abs(time - nearestGrid);
            avgOffset += offset;
        }
        avgOffset = avgOffset / rawNoteOns.length;
    }

    // 偏移从0到unitMs，分数从100到40
    var rhythmScore = Math.max(40, Math.min(100, 100 - (avgOffset / (unitMs * 0.5)) * 60));

    // ---- 2. 创意度评分 ----
    // 思路：音高跨度大、节奏有变化、音符密度适中 = 有创意
    var pitches = quantizedNotes.map(function(n) { return n.note; });
    var minPitch = Math.min.apply(null, pitches);
    var maxPitch = Math.max.apply(null, pitches);
    var pitchRange = maxPitch - minPitch; // 音高跨度

    // 节奏变化：音符时长的多样性
    var durations = quantizedNotes.map(function(n) { return n.durationBeats; });
    var uniqueDurations = {};
    durations.forEach(function(d) { uniqueDurations[d.toFixed(1)] = true; });
    var rhythmVariety = Object.keys(uniqueDurations).length;

    // 音符密度：每拍多少个音
    var noteDensity = quantizedNotes.length / totalBeats;

    // 综合创意度
    var rangeScore = Math.min(100, pitchRange * 8); // 跨度越大越有创意，最多12个半音就满分
    var varietyScore = Math.min(100, rhythmVariety * 25); // 节奏变化越多越有创意
    // 密度：1-3个音/拍最好，太多太少都扣分
    var densityScore = noteDensity >= 1 && noteDensity <= 3 ? 100 :
                       noteDensity < 1 ? 40 + noteDensity * 60 :
                       Math.max(40, 100 - (noteDensity - 3) * 20);

    var creativityScore = Math.round(rangeScore * 0.4 + varietyScore * 0.3 + densityScore * 0.3);

    // ---- 3. 风格匹配度（和谐度）----
    // 思路：统计旋律音在和弦内音的比例
    var chordNotes = [];
    // 收集所有和弦内音
    for (var c = 0; c < lightarr.length; c++) {
        lightarr[c].noteArray.forEach(function(n) {
            var pc = n % 12;
            if (chordNotes.indexOf(pc) === -1) chordNotes.push(pc);
        });
    }

    var inChordCount = 0;
    quantizedNotes.forEach(function(n) {
        var pc = n.note % 12;
        // 检查是否在和弦内，或者是相邻的经过音（也算和谐）
        if (chordNotes.indexOf(pc) !== -1) {
            inChordCount++;
        } else {
            // 相邻音也算（比如经过音）
            for (var ci = 0; ci < chordNotes.length; ci++) {
                if (Math.abs(chordNotes[ci] - pc) === 1 || Math.abs(chordNotes[ci] - pc) === 11) {
                    inChordCount += 0.5; // 半音关系算一半
                    break;
                }
            }
        }
    });

    var harmonyRatio = inChordCount / quantizedNotes.length;
    // 80%左右最和谐又不无聊，太高了太单调，太低了太刺耳
    var harmonyScore = harmonyRatio >= 0.7 && harmonyRatio <= 0.95 ? 100 :
                       harmonyRatio < 0.7 ? Math.round(40 + harmonyRatio * 60 / 0.7) :
                       Math.round(100 - (harmonyRatio - 0.95) * 200);
    harmonyScore = Math.max(40, Math.min(100, harmonyScore));

    // ---- 总分 ----
    var totalScore = Math.round(rhythmScore * 0.35 + creativityScore * 0.35 + harmonyScore * 0.3);

    return {
        rhythm: Math.round(rhythmScore),
        creativity: creativityScore,
        harmony: harmonyScore,
        total: totalScore,
        noteCount: quantizedNotes.length,
        pitchRange: pitchRange,
        density: noteDensity.toFixed(1)
    };
}

// ===== 2. AI毒舌/暖心点评 =====

function getComment(score) {
    var total = score.total;

    // 不同分段有不同风格的点评
    if (total >= 90) {
        return getRandomItem([
            "🎹 「卧槽你是钢琴家吧？」",
            "✨ 「建议直接出道」",
            "🎵 「肖邦听了都要给你点赞」",
            "🏆 「这水平，是我带过最好的一届学生」",
            "💎 「被埋没的音乐天才」"
        ]);
    } else if (total >= 80) {
        return getRandomItem([
            "😊 「不错哦，有点东西」",
            "🎯 「节奏感可以，再加点创意就完美了」",
            "👍 「听起来像那么回事儿」",
            "🎸 「继续练，下次就能组乐队了」",
            "🌙 「适合深夜一个人听的旋律」"
        ]);
    } else if (total >= 70) {
        return getRandomItem([
            "🙂 「嗯……很有个人风格」",
            "🎨 「创意不错，节奏可以再练练」",
            "💡 「我听到了你的想法，虽然有点抽象」",
            "🎪 「像游乐园的音乐——热闹」",
            "🌈 「充满了可能性」"
        ]);
    } else if (total >= 60) {
        return getRandomItem([
            "🤔 「怎么说呢……挺有实验精神的」",
            "🎲 「随机感很强，像抽奖一样」",
            "🐱 「像猫踩在钢琴上弹的」",
            "🌪 「旋律有点自由，比我的人生还自由」",
            "🔮 「未来派音乐，我还没学会欣赏」"
        ]);
    } else if (total >= 50) {
        return getRandomItem([
            "😂 「朋友，你是来砸场子的吧」",
            "🐒 「猴子随便按都比你强……吧？」",
            "💀 「听完我的耳朵需要急救」",
            "🎭 「行为艺术？我懂了」",
            "🃏 「这牌打得也忒好了」"
        ]);
    } else {
        return getRandomItem([
            "🙈 「要不……咱们还是换个爱好？」",
            "💩 「听君一曲，如听一曲」",
            "🤡 「小丑竟是我自己，居然听完了」",
            "🌚 「建议直接转行，音乐这条路不适合你」",
            "🗑 「垃圾桶在哪里，我把这段旋律扔了」"
        ]);
    }
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ===== 3. 成就徽章系统 =====

var achievements = [
    { id: 'first_song', name: '🎵 初试啼声', desc: '完成第一首作品', check: function(s) { return s.noteCount > 0; } },
    { id: 'rhythm_master', name: '🥁 节奏大师', desc: '节奏感评分90+', check: function(s) { return s.rhythm >= 90; } },
    { id: 'creative_genius', name: '🎨 创意鬼才', desc: '创意度评分90+', check: function(s) { return s.creativity >= 90; } },
    { id: 'harmony_king', name: '🎼 和谐之王', desc: '和谐度评分90+', check: function(s) { return s.harmony >= 90; } },
    { id: 'note_explorer', name: '🚀 音符探险家', desc: '音域超过12个半音', check: function(s) { return s.pitchRange >= 12; } },
    { id: 'speed_demon', name: '⚡ 无影手', desc: '每秒超过4个音', check: function(s) { return parseFloat(s.density) >= 2; } },
    { id: 'minimalist', name: '🧘 极简主义', desc: '少于8个音符', check: function(s) { return s.noteCount > 0 && s.noteCount <= 8; } },
    { id: 'full_score', name: '👑 音乐全才', desc: '总分95+', check: function(s) { return s.total >= 95; } }
];

function unlockAchievements(score) {
    var unlocked = [];
    // 从localStorage读取已解锁的
    var unlockedIds = [];
    try {
        unlockedIds = JSON.parse(localStorage.getItem('mg_achievements') || '[]');
    } catch(e) {}

    for (var i = 0; i < achievements.length; i++) {
        var a = achievements[i];
        if (unlockedIds.indexOf(a.id) === -1 && a.check(score)) {
            unlocked.push(a);
            unlockedIds.push(a.id);
        }
    }

    try {
        localStorage.setItem('mg_achievements', JSON.stringify(unlockedIds));
    } catch(e) {}

    return unlocked;
}

function getAllAchievements() {
    var unlockedIds = [];
    try {
        unlockedIds = JSON.parse(localStorage.getItem('mg_achievements') || '[]');
    } catch(e) {}
    return achievements.map(function(a) {
        return {
            ...a,
            unlocked: unlockedIds.indexOf(a.id) !== -1
        };
    });
}

// ===== 4. 鼓点伴奏 =====

var drumTimer = null;
var drumIsPlaying = false;

function startDrums(bpm) {
    if (drumIsPlaying) return;
    drumIsPlaying = true;

    var beatMs = 60000 / bpm;
    var beatCount = 0;

    function playBeat() {
        if (!drumIsPlaying) return;
        var beatInBar = beatCount % 4;

        if (beatInBar === 0) {
            // 强拍：底鼓
            port.send([0x99, 36, 0x70]); // Kick
        } else if (beatInBar === 2) {
            // 弱拍：军鼓
            port.send([0x99, 38, 0x50]); // Snare
        }

        // 每拍都有踩镲
        port.send([0x99, 42, 0x30]); // Hi-Hat

        // 八分音符的踩镲
        setTimeout(function() {
            if (drumIsPlaying) {
                port.send([0x99, 42, 0x20]);
            }
        }, beatMs / 2);

        beatCount++;
        drumTimer = setTimeout(playBeat, beatMs);
    }

    playBeat();
}

function stopDrums() {
    drumIsPlaying = false;
    if (drumTimer) {
        clearTimeout(drumTimer);
        drumTimer = null;
    }
    // 关闭所有鼓音
    for (var i = 35; i < 82; i++) {
        port.send([0x89, i, 0]);
    }
}

// ===== 5. 分享卡片生成 =====

function generateShareCard(score, comment, chordName) {
    var canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    var ctx = canvas.getContext('2d');

    // ===== 背景：深色霓虹渐变 =====
    var bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
    bgGrad.addColorStop(0, '#0a0a1a');
    bgGrad.addColorStop(0.5, '#1a0a2e');
    bgGrad.addColorStop(1, '#0a1a2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 800);

    // 背景光斑
    var spot1 = ctx.createRadialGradient(120, 150, 0, 120, 150, 200);
    spot1.addColorStop(0, 'rgba(255, 107, 157, 0.3)');
    spot1.addColorStop(1, 'transparent');
    ctx.fillStyle = spot1;
    ctx.fillRect(0, 0, 300, 350);

    var spot2 = ctx.createRadialGradient(480, 650, 0, 480, 650, 200);
    spot2.addColorStop(0, 'rgba(77, 212, 255, 0.25)');
    spot2.addColorStop(1, 'transparent');
    ctx.fillStyle = spot2;
    ctx.fillRect(300, 450, 300, 350);

    var spot3 = ctx.createRadialGradient(300, 400, 0, 300, 400, 250);
    spot3.addColorStop(0, 'rgba(196, 77, 255, 0.15)');
    spot3.addColorStop(1, 'transparent');
    ctx.fillStyle = spot3;
    ctx.fillRect(50, 150, 500, 500);

    // 网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < 600; gx += 50) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, 800);
        ctx.stroke();
    }
    for (var gy = 0; gy < 800; gy += 50) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(600, gy);
        ctx.stroke();
    }

    // ===== 毛玻璃卡片 =====
    ctx.fillStyle = 'rgba(30, 30, 60, 0.85)';
    roundRect(ctx, 40, 100, 520, 620, 24);
    ctx.fill();

    // 卡片边框发光
    ctx.strokeStyle = 'rgba(196, 77, 255, 0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, 40, 100, 520, 620, 24);
    ctx.stroke();

    // ===== 标题 =====
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎹 音乐涂鸦', 300, 170);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Arial';
    ctx.fillText('零音乐基础 · 随便弹也好听', 300, 200);

    // ===== 渐变数字总分 =====
    var totalGrad = ctx.createLinearGradient(0, 240, 0, 360);
    totalGrad.addColorStop(0, '#ff6b9d');
    totalGrad.addColorStop(0.5, '#c44dff');
    totalGrad.addColorStop(1, '#4dd4ff');
    ctx.fillStyle = totalGrad;
    ctx.font = 'bold 96px Arial';
    ctx.fillText(score.total + '', 300, 340);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '14px Arial';
    ctx.fillText('AI 综合评分', 300, 370);

    // ===== 三项分数 =====
    var items = [
        { label: '节奏感', value: score.rhythm, color: '#ff9800' },
        { label: '创意度', value: score.creativity, color: '#c44dff' },
        { label: '和谐度', value: score.harmony, color: '#4dd4ff' }
    ];

    var startY = 410;
    var barWidth = 120;
    var barHeight = 8;
    var gap = 50;
    var startX = (600 - (barWidth * 3 + gap * 2)) / 2;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var x = startX + i * (barWidth + gap);

        // 标签
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '13px Arial';
        ctx.fillText(item.label, x + barWidth / 2, startY);

        // 分数
        ctx.fillStyle = item.color;
        ctx.font = 'bold 28px Arial';
        ctx.fillText(item.value, x + barWidth / 2, startY + 38);

        // 进度条背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, x, startY + 50, barWidth, barHeight, 4);
        ctx.fill();

        // 进度条渐变
        var barGrad = ctx.createLinearGradient(x, 0, x + barWidth, 0);
        barGrad.addColorStop(0, '#ff6b9d');
        barGrad.addColorStop(0.5, '#c44dff');
        barGrad.addColorStop(1, '#4dd4ff');
        ctx.fillStyle = barGrad;
        roundRect(ctx, x, startY + 50, barWidth * item.value / 100, barHeight, 4);
        ctx.fill();
    }

    // ===== AI点评气泡 =====
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    roundRect(ctx, 70, 530, 460, 100, 16);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, 70, 530, 460, 100, 16);
    ctx.stroke();

    // "AI点评"标签
    ctx.fillStyle = '#ff6b9d';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('🎤 AI 点评', 300, 560);

    // 点评内容
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    var commentLines = wrapText(ctx, comment, 400);
    var commentStartY = 585 + (100 - 40 - commentLines.length * 22) / 2;
    for (var l = 0; l < commentLines.length; l++) {
        ctx.fillText(commentLines[l], 300, commentStartY + l * 22);
    }

    // ===== 底部信息 =====
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '13px Arial';
    ctx.fillText(
        chordName + '  ·  ' + score.noteCount + ' 个音符  ·  ' + score.pitchRange + ' 半音跨度',
        300, 680
    );

    // Logo
    var logoGrad = ctx.createLinearGradient(150, 0, 450, 0);
    logoGrad.addColorStop(0, '#ff6b9d');
    logoGrad.addColorStop(0.5, '#c44dff');
    logoGrad.addColorStop(1, '#4dd4ff');
    ctx.fillStyle = logoGrad;
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Music Graffiti', 300, 720);

    return canvas.toDataURL('image/png');
}

// 工具函数：圆角矩形
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// 工具函数：文字换行
function wrapText(ctx, text, maxWidth) {
    var lines = [];
    var currentLine = '';
    for (var i = 0; i < text.length; i++) {
        var testLine = currentLine + text[i];
        var metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = text[i];
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}
