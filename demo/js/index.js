let flag = false   // 判断鼠标是否按下
let pianokey, initialTime;   // 音键音符,点击播放时初始时间戳
JZZ.synth.Tiny.register('Synth');
var port = JZZ().openMidiOut().or(function () { console.log('Cannot open MIDI port!'); });
// 页面加载后提示用户点击开始（浏览器自动播放策略需要用户交互）
var audioContextReady = false;
function unlockAudio() {
    if (audioContextReady) return;
    audioContextReady = true;
    // 静默解锁音频，不播放任何声音
    console.log('Audio unlocked! 音频已解锁');
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
}
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);
document.addEventListener('touchstart', unlockAudio);
let keyarr = [];  // 琴键数组?
let submitarr = [];  // 实际按键数组
let lightarr = [];   // 高亮数组
let playmid_url;    // midi文件路径
let tryplaymid_url;    // 试听midi文件路径
let showTimeBool = false     // 是否在准备时间 (demo模式默认关闭，进来就能弹)
let showTimeObj = {         //  准备时间监听
    time
}
let beatTime = 1;         //  一拍多少秒
let isDemoMode = false;    // 是否为离线演示模式
let demoChordTimer = null; // 演示模式和弦播放定时器
let demoCurrentChordIndex = 0; // 当前和弦索引

// pc端
function pcfunction() {
    $('.pianokey').mousedown(function (e) {
        if (showTimeBool) {
            return
        }
        var ev = e || window.event;
        ev.preventDefault();
        pianokey = $(this).attr('data-index')
        flag = true;
        if ($(this).hasClass('whitebox')) {
            $(this).addClass('downwhitebox')
        } else if ($(this).hasClass('blackbox')) {
            $(this).addClass('downblackbox')
        }
        port.send([0x90, pianokey, 0x7f]);

        // 演示模式：录制所有按键（自由涂鸦）
        if (isDemoMode && demoIsPlaying) {
            recordNote('note_on', Number(pianokey), 0x7f);
            dealTime('note_on', pianokey);
        } else if (initialTime != null) {
            // 正常模式：只记录高亮的键
            if ($(this).hasClass('lightwhite') || $(this).hasClass('lightblack')) {
                dealTime('note_on', pianokey)
            }
        }
    });
    $('.pianokey').mouseup(function (e) {
        if (showTimeBool) {
            return
        }
        var ev = e || window.event;
        ev.preventDefault();
        pianokey = $(this).attr('data-index')
        flag = false;
        if ($(this).hasClass('whitebox')) {
            $(this).removeClass('downwhitebox')
        } else if ($(this).hasClass('blackbox')) {
            $(this).removeClass('downblackbox')
        }
        port.send([0x80, pianokey, 0x7f]);

        // 演示模式：录制所有松键
        if (isDemoMode && demoIsPlaying) {
            recordNote('note_off', Number(pianokey), 0x7f);
            dealTime('note_off', pianokey)
        } else if (initialTime) {
            if ($(this).hasClass('lightwhite') || $(this).hasClass('lightblack')) {
                dealTime('note_off', pianokey)
            }
        }
    });
}

// 移动端
function mobilefunction() {
    let pianobox = document.querySelector('.apppiancon')
    pianobox.addEventListener('touchstart', (e) => {
        if (showTimeBool) {
            return
        }
        keyarr = [];
        var ev = e || window.event;
        ev.preventDefault();
        pianokey = e.target.dataset.index;
        if (initialTime == null) {
            if ($(e.target).hasClass('whitebox')) {
                $(e.target).addClass('downwhitebox')
            } else if ($(e.target).hasClass('blackbox')) {
                $(e.target).addClass('downblackbox')
            }
            port.send([0x90, pianokey, 0x7f]);
        } else {
            if ($(e.target).hasClass('lightwhite') || $(e.target).hasClass('lightblack')) {
                if ($(e.target).hasClass('whitebox')) {
                    $(e.target).addClass('downwhitebox')
                } else if ($(e.target).hasClass('blackbox')) {
                    $(e.target).addClass('downblackbox')
                }
                port.send([0x90, pianokey, 0x7f]);
                dealTime('note_on', pianokey)
            }
        }
        
    })
    pianobox.addEventListener('touchend', (e) => {
        if (showTimeBool) {
            return
        }
        end_time=new Date().getTime()
        keyarr = [];
        var ev = e || window.event;
        ev.preventDefault();
        pianokey = e.target.dataset.index;
        if ($(e.target).hasClass('whitebox')) {
            $(e.target).removeClass('downwhitebox')
        } else if ($(e.target).hasClass('blackbox')) {
            $(e.target).removeClass('downblackbox')
        }
        if (initialTime) {
            if ($(e.target).hasClass('lightwhite') || $(e.target).hasClass('lightblack')) {
                dealTime('note_off', pianokey)
            }
        }
        port.send([0x80, pianokey, 0x7f]);
    })
}

// 离线演示模式 - mock和弦数据
function getMockChordData(cardNum) {
    isDemoMode = true;
    console.log('[Demo Mode] 使用离线演示数据，卡片' + cardNum);

    // 120 BPM → 一拍0.5秒，一小节2秒
    var bpm = 120;
    var beat = 60 / bpm; // 0.5s per beat
    var bar = beat * 4;  // 2s per bar

    // 音符定义（MIDI note number）
    var C4 = 60, D4 = 62, E4 = 64, F4 = 65, G4 = 67, A4 = 69, B4 = 71;
    var C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79, A5 = 81, B5 = 83;

    var lightUp = [];
    var audioUrl = '';

    if (cardNum == 1) {
        // 卡片1：C - F - Am - G
        audioUrl = './chord/chord_1_default.mp3';

        // 前奏（pre_data）：2小节准备时间
        lightUp.push({ action: 'prep', chord: '准备', noteArray: [C4, E4, G4], beginRealTime: 0, endRealTime: bar * 1 });
        lightUp.push({ action: 'prep', chord: '准备', noteArray: [C4, E4, G4], beginRealTime: bar * 1, endRealTime: bar * 2 });

        // 正片（lightarr）：8小节循环
        // C 和弦
        lightUp.push({ action: 'play', chord: 'C', noteArray: [C4, E4, G4, C5], beginRealTime: bar * 2, endRealTime: bar * 4 });
        // F 和弦
        lightUp.push({ action: 'play', chord: 'F', noteArray: [F4, A4, C5, F5], beginRealTime: bar * 4, endRealTime: bar * 6 });
        // Am 和弦
        lightUp.push({ action: 'play', chord: 'Am', noteArray: [A4, C5, E5], beginRealTime: bar * 6, endRealTime: bar * 8 });
        // G 和弦
        lightUp.push({ action: 'play', chord: 'G', noteArray: [G4, B4, D5, G5], beginRealTime: bar * 8, endRealTime: bar * 10 });
        // 再来一遍
        lightUp.push({ action: 'play', chord: 'C', noteArray: [C4, E4, G4, C5], beginRealTime: bar * 10, endRealTime: bar * 12 });
        lightUp.push({ action: 'play', chord: 'F', noteArray: [F4, A4, C5, F5], beginRealTime: bar * 12, endRealTime: bar * 14 });
        lightUp.push({ action: 'play', chord: 'Am', noteArray: [A4, C5, E5], beginRealTime: bar * 14, endRealTime: bar * 16 });
        lightUp.push({ action: 'play', chord: 'G', noteArray: [G4, B4, D5, G5], beginRealTime: bar * 16, endRealTime: bar * 18 });

    } else {
        // 卡片2：Am - G - F - C
        audioUrl = './chord/chord_2_default.mp3';

        // 前奏（pre_data）：2小节准备时间
        lightUp.push({ action: 'prep', chord: '准备', noteArray: [A4, C5, E5], beginRealTime: 0, endRealTime: bar * 1 });
        lightUp.push({ action: 'prep', chord: '准备', noteArray: [A4, C5, E5], beginRealTime: bar * 1, endRealTime: bar * 2 });

        // 正片（lightarr）：8小节循环
        // Am 和弦
        lightUp.push({ action: 'play', chord: 'Am', noteArray: [A4, C5, E5], beginRealTime: bar * 2, endRealTime: bar * 4 });
        // G 和弦
        lightUp.push({ action: 'play', chord: 'G', noteArray: [G4, B4, D5, G5], beginRealTime: bar * 4, endRealTime: bar * 6 });
        // F 和弦
        lightUp.push({ action: 'play', chord: 'F', noteArray: [F4, A4, C5, F5], beginRealTime: bar * 6, endRealTime: bar * 8 });
        // C 和弦
        lightUp.push({ action: 'play', chord: 'C', noteArray: [C4, E4, G4, C5], beginRealTime: bar * 8, endRealTime: bar * 10 });
        // 再来一遍
        lightUp.push({ action: 'play', chord: 'Am', noteArray: [A4, C5, E5], beginRealTime: bar * 10, endRealTime: bar * 12 });
        lightUp.push({ action: 'play', chord: 'G', noteArray: [G4, B4, D5, G5], beginRealTime: bar * 12, endRealTime: bar * 14 });
        lightUp.push({ action: 'play', chord: 'F', noteArray: [F4, A4, C5, F5], beginRealTime: bar * 14, endRealTime: bar * 16 });
        lightUp.push({ action: 'play', chord: 'C', noteArray: [C4, E4, G4, C5], beginRealTime: bar * 16, endRealTime: bar * 18 });
    }

    return {
        code: 0,
        data: {
            lightUp: lightUp,
            audioFileUrl: audioUrl,
            bmp: bpm
        }
    };
}

// ========== 演示模式：JZZ.js 实时合成和弦伴奏 ==========

// 播放单个和弦（JZZ.js合成）
function playChordNotes(noteArray, durationMs) {
    // 按下所有和弦音
    for (var i = 0; i < noteArray.length; i++) {
        port.send([0x90, noteArray[i], 0x60]); // 力度稍轻，作为伴奏
    }
    // durationMs 后松开
    setTimeout(function() {
        for (var i = 0; i < noteArray.length; i++) {
            port.send([0x80, noteArray[i], 0x40]);
        }
    }, durationMs * 0.95); // 稍微提前一点松开，避免爆音
}

// 演示模式播放和弦进行
var demoPlayInterval = null;
var demoStartTime = 0;
var demoIsPlaying = false;

function demoPlayChordProgression() {
    if (!lightarr || lightarr.length === 0) return;

    demoIsPlaying = true;
    demoCurrentChordIndex = 0;
    demoStartTime = Date.now();

    // 开始录制用户的旋律
    startRecording();

    // 启动鼓点
    startDrums(120);

    // 先播放第一个和弦
    playNextDemoChord();
}

function playNextDemoChord() {
    if (!demoIsPlaying || demoCurrentChordIndex >= lightarr.length) {
        // 播完了，生成作品
        setTimeout(function() {
            demoGenerateAndPlay();
        }, beatTime * 4 * 1000); // 等最后一个和弦播完
        return;
    }

    var chord = lightarr[demoCurrentChordIndex];

    // 更新UI显示当前和弦名
    $('.toplefttext-item').html(chord.chord);
    $('#chord_current').html('当前: ' + chord.chord);

    // 高亮琴键
    closelightFun();
    chord.noteArray.forEach(function(note) {
        $(".pianokey").each(function () {
            if ($(this).attr('data-index') == note) {
                if ($(this).hasClass('whitebox')) {
                    $(this).addClass('lightwhite')
                } else if ($(this).hasClass('blackbox')) {
                    $(this).addClass('lightblack')
                }
            }
        });
    });

    // 播放和弦（用分解和弦方式，更好听）
    playChordArpeggio(chord.noteArray, beatTime * 4 * 1000);

    demoCurrentChordIndex++;

    // 计算下一个和弦的时间
    var nextDelay = beatTime * 4 * 1000; // 每小节一个和弦
    demoPlayInterval = setTimeout(playNextDemoChord, nextDelay);
}

// 分解和弦播放（琶音效果，更好听）
function playChordArpeggio(noteArray, durationMs) {
    var noteDelay = 150; // 每个音之间的间隔
    var noteDuration = durationMs - noteDelay * noteArray.length + 50;

    for (var i = 0; i < noteArray.length; i++) {
        (function(idx) {
            setTimeout(function() {
                port.send([0x90, noteArray[idx], 0x55]); // 按下
                // 持续到小节结束
                setTimeout(function() {
                    port.send([0x80, noteArray[idx], 0x40]); // 松开
                }, noteDuration);
            }, idx * noteDelay);
        })(i);
    }
}

// 停止演示模式和弦播放
function demoStopChords() {
    demoIsPlaying = false;
    if (demoPlayInterval) {
        clearTimeout(demoPlayInterval);
        demoPlayInterval = null;
    }
    stopDrums();
    closelightFun();
    // 所有音静音（防止卡住）
    for (var i = 0; i < 128; i++) {
        port.send([0x80, i, 0]);
        port.send([0x89, i, 0]); // 鼓组通道也静音
    }
}

// ========== 核心功能：旋律量化 + 自动合成 ==========

// 录制的旋律数据（演示模式下实时收集）
var recordedMelody = [];
var recordingStartTime = 0;

// 开始录制旋律
function startRecording() {
    recordedMelody = [];
    recordingStartTime = Date.now();
}

// 录制一个音符事件
function recordNote(type, note, velocity) {
    if (!demoIsPlaying || showTimeBool) return; // 只有正式播放时才录
    var now = Date.now();
    recordedMelody.push({
        type: type,
        note: note,
        velocity: velocity || 90,
        time: now - recordingStartTime // 相对开始时间，毫秒
    });
}

// 旋律量化：把自由弹奏的音符对齐到节拍网格
// 输入：recordedMelody（原始弹奏数据）
// 输出：quantizedNotes（量化后的音符数组 [{note, startBeat, durationBeats, velocity}]）
function quantizeMelody(rawNotes, bpm) {
    var beatMs = 60000 / bpm; // 一拍多少毫秒
    var quantizationUnit = 0.5; // 量化到八分音符（0.5拍）
    var unitMs = beatMs * quantizationUnit;

    // 第一步：把 note_on / note_off 配对成音符
    var noteOnEvents = {};
    var notes = [];

    for (var i = 0; i < rawNotes.length; i++) {
        var evt = rawNotes[i];
        if (evt.type === 'note_on') {
            noteOnEvents[evt.note] = evt.time;
        } else if (evt.type === 'note_off' && noteOnEvents[evt.note] !== undefined) {
            var startTime = noteOnEvents[evt.note];
            var duration = evt.time - startTime;
            notes.push({
                note: evt.note,
                startTime: startTime,
                duration: Math.max(duration, 100), // 最短100ms
                velocity: evt.velocity
            });
            delete noteOnEvents[evt.note];
        }
    }

    // 第二步：量化起始时间到最近的八分音符网格
    var quantized = notes.map(function(n) {
        // 计算最近的量化单元
        var startUnits = Math.round(n.startTime / unitMs);
        var durationUnits = Math.max(1, Math.round(n.duration / unitMs));

        return {
            note: n.note,
            startBeat: startUnits * quantizationUnit,
            durationBeats: durationUnits * quantizationUnit,
            velocity: n.velocity
        };
    });

    // 第三步：按起始时间排序
    quantized.sort(function(a, b) {
        return a.startBeat - b.startBeat;
    });

    return quantized;
}

// 根据当前小节的旋律音符，匹配最合适的和弦
// 简单算法：统计这个小节里出现最多的音，匹配和弦
function detectChordForBar(notesInBar, chordOptions) {
    if (notesInBar.length === 0) return 0; // 没音符就用第一个和弦

    // 统计每个音符出现的时长
    var noteCount = {};
    for (var i = 0; i < notesInBar.length; i++) {
        var n = notesInBar[i];
        var pitchClass = n.note % 12; // 转成音级（C=0, C#=1...B=11）
        noteCount[pitchClass] = (noteCount[pitchClass] || 0) + n.durationBeats;
    }

    // 找到出现最多的音
    var maxCount = 0;
    var mainNote = 0;
    for (var pc in noteCount) {
        if (noteCount[pc] > maxCount) {
            maxCount = noteCount[pc];
            mainNote = parseInt(pc);
        }
    }

    // 简单匹配：根据主音找最匹配的和弦（简化版）
    // 实际项目里用的是更复杂的和弦进行规则
    // 这里我们直接用预设的和弦进行，因为卡片已经限定了和弦走向
    return -1; // -1 表示用预设的和弦序列
}

// 合成播放：量化后的旋律 + 和弦伴奏 一起播放
function playSynthesizedMelody(quantizedNotes, bpm) {
    var beatMs = 60000 / bpm;
    var totalBeats = lightarr.length * 4; // 总拍数 = 和弦数 * 4拍

    // 停止之前的播放
    demoStopChords();

    // 计算总时长
    var totalMs = totalBeats * beatMs;

    // 旋律播放调度（红色高亮 + 声音）
    for (var i = 0; i < quantizedNotes.length; i++) {
        var n = quantizedNotes[i];
        var startTime = n.startBeat * beatMs;
        var duration = n.durationBeats * beatMs;

        if (startTime >= totalMs) continue; // 超出范围的跳过

        // 用闭包保存变量
        (function(note, start, dur) {
            // 音符开始：发声 + 红色高亮
            setTimeout(function() {
                port.send([0x90, note, 0x70]); // 旋律力度稍大
                // 高亮红色（旋律 = 你创作的部分）
                $(".pianokey").each(function () {
                    if ($(this).attr('data-index') == note) {
                        if ($(this).hasClass('whitebox')) {
                            $(this).addClass('melodywhite')
                        } else if ($(this).hasClass('blackbox')) {
                            $(this).addClass('melodyblack')
                        }
                    }
                });
            }, start);
            // 音符结束：消音 + 取消红色
            setTimeout(function() {
                port.send([0x80, note, 0x40]);
                $(".pianokey").each(function () {
                    if ($(this).attr('data-index') == note) {
                        $(this).removeClass('melodywhite melodyblack')
                    }
                });
            }, start + dur * 0.9);
        })(n.note, startTime, duration);
    }

    // 和弦伴奏播放调度（黄色高亮 + 低八度声音）
    var currentBar = 0;
    function playNextChordSynth() {
        if (currentBar >= lightarr.length) return;

        var chord = lightarr[currentBar];
        // 更新UI
        $('.toplefttext-item').html('🎵 ' + chord.chord);
        $('#chord_current').html('回放: ' + chord.chord);
        // 高亮（黄色 = 伴奏）
        // 注意：不调用closelightFun，避免清除旋律的红色高亮
        chord.noteArray.forEach(function(note) {
            $(".pianokey").each(function () {
                if ($(this).attr('data-index') == note) {
                    if ($(this).hasClass('whitebox')) {
                        $(this).addClass('lightwhite')
                    } else if ($(this).hasClass('blackbox')) {
                        $(this).addClass('lightblack')
                    }
                }
            });
        });
        // 播放和弦（低八度，音量小一点当伴奏）
        playChordPads(chord.noteArray, beatMs * 4);

        // 一小节后清除这个和弦的高亮（但保留旋律红色）
        var barIndex = currentBar;
        setTimeout(function() {
            var ch = lightarr[barIndex];
            if (!ch) return;
            ch.noteArray.forEach(function(note) {
                $(".pianokey").each(function () {
                    if ($(this).attr('data-index') == note) {
                        $(this).removeClass('lightwhite lightblack')
                    }
                });
            });
        }, beatMs * 4);

        currentBar++;
        if (currentBar < lightarr.length) {
            setTimeout(playNextChordSynth, beatMs * 4);
        }
    }
    playNextChordSynth();

    return totalMs;
}

// 柱式和弦伴奏（PAD音色感觉，音量较小）
function playChordPads(noteArray, durationMs) {
    var velocity = 0x40; // 伴奏音量小一点
    for (var i = 0; i < noteArray.length; i++) {
        port.send([0x90, noteArray[i] - 12, velocity]); // 低八度
    }
    setTimeout(function() {
        for (var i = 0; i < noteArray.length; i++) {
            port.send([0x80, noteArray[i] - 12, 0x40]);
        }
    }, durationMs * 0.95);
}

// 演示模式：播放结束后自动生成并播放结果
function demoGenerateAndPlay() {
    if (recordedMelody.length === 0) {
        $('.toplefttext-item').html('你没弹哦~ 再试一次');
        $(".start").hide();
        $(".stop").show();
        $(".imggif").hide();
        $(".imgpng").show();
        return;
    }

    var bpm = 120;
    // 第一步：量化旋律
    var quantized = quantizeMelody(recordedMelody, bpm);
    var rawNoteCount = Math.floor(recordedMelody.length / 2);

    // 第二步：AI评分
    var score = calculateScore(quantized, recordedMelody, bpm, lightarr);
    var comment = getComment(score);
    var newAchievements = unlockAchievements(score);

    // 第三步：获取和弦名称
    var chordName = lightarr[0].chord + '-' + lightarr[lightarr.length - 1].chord + ' 进行';

    // 显示作品面板
    $('#result_dom').show();
    $('#result_total').html(score.total);
    $('#result_rhythm').html(score.rhythm);
    $('#result_creativity').html(score.creativity);
    $('#result_harmony').html(score.harmony);
    $('#rhythm_bar').css('width', score.rhythm + '%');
    $('#creativity_bar').css('width', score.creativity + '%');
    $('#harmony_bar').css('width', score.harmony + '%');
    $('#result_comment').html(comment);
    $('#result_stats').html(
        '🎹 ' + rawNoteCount + ' 个音符 · ' +
        '📏 ' + score.pitchRange + ' 半音跨度 · ' +
        '⚡ ' + score.density + ' 音/拍'
    );

    // 成就展示
    if (newAchievements.length > 0) {
        $('#achievement_box').show();
        var achHtml = '';
        for (var i = 0; i < newAchievements.length; i++) {
            achHtml += '<div style="background: #fff3e0; border-radius: 8px; padding: 6px 10px; font-size: 12px; color: #e65100;">' +
                        newAchievements[i].name + '</div>';
        }
        $('#achievement_list').html(achHtml);
    } else {
        $('#achievement_box').hide();
    }

    // 分享按钮
    document.getElementById('result_share').onclick = function() {
        var dataUrl = generateShareCard(score, comment, chordName);
        $('#share_img').attr('src', dataUrl);
        $('#share_dom').show();
    };

    // 关闭分享
    document.getElementById('share_close').onclick = function() {
        $('#share_dom').hide();
    };
    $('#share_dom').click(function(e) {
        if (e.target.id === 'share_dom') {
            $('#share_dom').hide();
        }
    });

    // 再玩一次按钮
    document.getElementById('result_close').onclick = function() {
        $('#result_dom').hide();
        $('#share_dom').hide();
        demoStopChords();
        stopDrums();
        closelightFun();
        $('.melodywhite').removeClass('melodywhite');
        $('.melodyblack').removeClass('melodyblack');
        $('.toplefttext-item').html(lightarr[0].chord);
        $('.toplefttext-item').css('color', '');
        $(".start").hide();
        $(".stop").show();
        $(".imggif").hide();
        $(".imgpng").show();
        cardtimeSecound = 0;
    };

    // 第四步：播放合成作品 + 鼓点
    $('.toplefttext-item').html('🎵 你的作品');
    $('.toplefttext-item').css('color', '#ff4444');

    setTimeout(function() {
        startDrums(bpm); // 启动鼓点
        var totalMs = playSynthesizedMelody(quantized, bpm);

        // 播放完后的回调
        setTimeout(function() {
            demoStopChords();
            stopDrums();
            $('.melodywhite').removeClass('melodywhite');
            $('.melodyblack').removeClass('melodyblack');
            $('.toplefttext-item').html('✅ 播放完成');
            $('.toplefttext-item').css('color', '');
        }, totalMs + 500);
    }, 1000); // 等用户看一眼分数再开始播放
}

// ========== 核心功能结束 ==========

// 获取和弦接口
let ordernum = 1;
let cardNumber = getQueryVariable('cardNumber')    // 获取卡片数字
function getchord() {
    // 本地环境直接使用演示数据，不请求线上API
    var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
    if (isLocal) {
        var mockRes = getMockChordData(Number(cardNumber));
        processChordData(mockRes.data);
        showDemoBanner();
        return;
    }

    $.ajax({
        type: "post",
        url: "http://159.75.18.44:8010/midi_api/chord",
        data: JSON.stringify({ "cardNumber": Number(cardNumber) }),
        contentType: "application/json",
        dataType: "json",
        success: function (res) {
            if (res.code == 0) {
                var res_data = res.data;
                processChordData(res_data);
            }
        },
        error: function () {
            // API失败时，使用离线演示数据
            var mockRes = getMockChordData(Number(cardNumber));
            processChordData(mockRes.data);
            showDemoBanner();
        }
    });
}

// 显示演示模式提示条
function showDemoBanner() {
    var banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff9800;color:#fff;padding:8px 16px;text-align:center;font-size:14px;z-index:9999;line-height:1.5;';
    banner.innerHTML = '🎹 音乐涂鸦 — 点▶️开始，跟着鼓点随便弹，AI给你打分写点评';
    document.body.appendChild(banner);
    // 把页面内容往下推一点，避免被banner挡住
    document.body.style.paddingTop = '50px';
}

// 处理和弦数据（提取公共逻辑）
function processChordData(res_data) {
    lightarr = res_data.lightUp.filter((item) => {
        return item.action == 'play'
    })
    pre_data = res_data.lightUp.filter((item) => {
        return item.action != 'play'
    })
    $('.toplefttext-item').html(lightarr[0].chord)
    playmid_url = res_data.audioFileUrl;
    beatTime = Number((60 / res_data.bmp).toFixed(2))
    $('#audioPlay1').attr('src', playmid_url);
    $('#app').show();
    var _audio = $('#audioPlay1')[0]
    _audio.load();
    _audio.oncanplay = function () {
        musicTimeFun(playmid_url, _audio.duration, '#time', 'card')
    }

    // 初始化和弦信息显示
    var styleName = cardNumber == 1 ? '流行经典' : '小调忧伤';
    var progressionName = getQueryVariable('name') || '';
    $('#chord_style').html(styleName);
    $('#chord_progression').html(progressionName.replace(/-/g, ' - '));
    $('#chord_current').html('当前: ' + lightarr[0].chord);
}

let pagetimer1 = {};
let timernumber1 = 0;
let pagetimer2 = {};
let timernumber2 = 0;
// 闪烁
function lightShow() {
    if (lightarr.length) {
        lightarr[0].noteArray.forEach((item) => {
            $(".pianokey").each(function () {
                if ($(this).attr('data-index') == item) {
                    if ($(this).hasClass('whitebox')) {
                        $(this).addClass('lightwhite')
                    } else if ($(this).hasClass('blackbox')) {
                        $(this).addClass('lightblack')
                    }
                }
                setTimeout(() => {
                    if ($(this).hasClass('whitebox')) {
                        $(this).removeClass('lightwhite')
                    } else if ($(this).hasClass('blackbox')) {
                        $(this).removeClass('lightblack')
                    }
                }, 300);
            })

        })
    }
}
// 显示高亮
function lightFun(ordernum, lightarr) {
    if (lightarr.length) {
        for (let i = 0; i < lightarr[ordernum - 1].noteArray.length; i++) {
            $(".pianokey").each(function () {
                if ($(this).attr('data-index') == lightarr[ordernum - 1].noteArray[i]) {
                    pagetimer1[timernumber1] = setTimeout(() => {
                        if ($(this).hasClass('whitebox')) {
                            $(this).addClass('lightwhite')
                        } else if ($(this).hasClass('blackbox')) {
                            $(this).addClass('lightblack')
                        }
                    }, lightarr[ordernum - 1].beginRealTime)
                    timernumber1 = timernumber1 + 1
                    pagetimer2[timernumber2] = setTimeout(() => {
                        if ($(this).hasClass('whitebox')) {
                            if($(this).attr('data-index')==dealkeyflash(lightarr[ordernum - 2].noteArray,lightarr[ordernum-1].noteArray)){
                                $(this).removeClass('lightwhite')
                            }else{
                                $(this).removeClass('lightwhite')
                            }
                        } else if ($(this).hasClass('blackbox')) {
                            if($(this).attr('data-index')==dealkeyflash(lightarr[ordernum - 2].noteArray,lightarr[ordernum-1].noteArray)){
                                $(this).removeClass('lightwhite')
                            }else{
                                $(this).removeClass('lightblack')
                            }
                        }
                        $('.toplefttext-item').html(lightarr[ordernum - 1].chord)
                    }, lightarr[ordernum - 1].endRealTime)
                    timernumber2 = timernumber2 + 1;
                }
            })
        }
        if (ordernum == lightarr.length) {
            return;
        }
        ordernum++;
        lightFun(ordernum, lightarr)
    }
}
// 关闭高亮
function closelightFun() {
    if (JSON.stringify(pagetimer1) !== "{}") {
        for (var each in pagetimer1) {
            window.clearInterval(pagetimer1[each])
        }
    }
    if (JSON.stringify(pagetimer2) !== "{}") {
        for (var each in pagetimer2) {
            window.clearInterval(pagetimer2[each])
        }
    }
    $(".pianokey").each(function () {
        if ($(this).hasClass('whitebox')) {
            $(this).removeClass('lightwhite')
        } else if ($(this).hasClass('blackbox')) {
            $(this).removeClass('lightblack')
        }
    })
}

// 处理当前按键组与下一组高亮重复相同键回显不闪烁问题
function dealkeyflash(now_arr,after_arr){
    for(let i=0;i<now_arr.length;i++){
        for(let j=0;j<after_arr.length;j++){
            if(now_arr[i]==after_arr[j]){
                return now_arr[i]
            }
        }
    }
}

// 处理钢琴按下或松开数据
function dealTime(type, pianokey) {
    var nowtime = new Date().getTime()
    let obj = {};
    obj.orderNumber = '';
    obj.type = type;
    obj.channel = 0;
    obj.note = Number(pianokey);
    obj.velocity = 99;
    obj.nowtime = nowtime
    obj.realTime = ''
    obj.midiTime = ''
    obj.initialTime = initialTime
    submitarr.push(obj)
}

let mid_style='default';
let mid_data={};
// 上传弹奏的音乐数组
function uploadFun() {
    if (submitarr.length) {
        submitarr.forEach((item, index) => {
            if (index == 0) {
                if(pre_data.length){
                    item.realTime = item.nowtime - item.initialTime -pre_data[pre_data.length -1].endRealTime;
                }else{
                    item.realTime = item.nowtime - item.initialTime;
                }
            } else {
                item.realTime = submitarr[index].nowtime - submitarr[index - 1].nowtime;
            }
            item.orderNumber = index + 1;
        })
        mid_data= {};
        mid_data.cardNumber = Number(cardNumber);
        mid_data.track = [];
        mid_data.style=mid_style;
        mid_data.generateHtml=true;
        for (let i in submitarr) {
            let obj = {};
            obj.orderNumber = submitarr[i].orderNumber;
            obj.type = submitarr[i].type;
            obj.channel = submitarr[i].channel;
            obj.note = submitarr[i].note;
            obj.velocity = submitarr[i].velocity;
            obj.realTime = submitarr[i].realTime;
            mid_data.track.push(obj)
        }
        // console.log(JSON.stringify(mid_data))
        $.ajax({
            type: "post",
            url: "http://159.75.18.44:8010/midi_api/melody",
            data: JSON.stringify(mid_data),
            processData: false,  // 不处理数据
            contentType: false, // 不设置内容类型
            success: function (res) {
                if (res.code == 0) {
                    // 跳页数据处理
                    window.location.href="./audition.html";
                    localStorage.setItem("midiMelodyTrack", JSON.stringify(res.data.midiMelodyTrack) );
                    localStorage.setItem("audioFileUrl", res.data.audioFileUrl );
                    localStorage.setItem("mid_track", JSON.stringify(mid_data.track) );
                    localStorage.setItem("cardNumber", cardNumber );
                    localStorage.setItem("mid_style", mid_style );
                    localStorage.setItem("htmlFileUrl", res.data.htmlFileUrl );
                    $('.loadingbox').hide()
                }
            },
            error: function () { }
        });
    }else{
        $('.loadingbox').hide()
    }
}

let cardtimeSecound, cardTimer = '', beatTimer = '', cardprogress_width, cardmidSecound;
// 获取(卡片)mid文件时长
function getcardmidTime(mid_url, dom) {
    MIDIjs.get_duration(mid_url, function (seconds) {
        cardtimeSecound = Math.round(seconds)
        showTimeObj.time = 0
        var timeval = swtchtime(cardtimeSecound)
        $(dom).html(timeval);
        cardmidSecound = Math.round(seconds)
    })
}

// 音乐时长处理
function musicTimeFun(mid_url,seconds,dom,type){
    if(type=='card'){
        cardtimeSecound = Math.round(seconds)
        var timeval = swtchtime(cardtimeSecound)
        $(dom).html(timeval);
        cardmidSecound = Math.round(seconds)
        console.log('card 获取(试听)mid文件时长')
        console.log(globalSecound)
        console.log(timeval)
        console.log(trymidSecound)
    }else if(type=='try'){
        globalSecound = Math.round(seconds)
        var timeval = swtchtime(globalSecound)
        $(dom).html(timeval);
        trymidSecound = Math.round(seconds)
        console.log('try 获取(试听)mid文件时长')
        console.log(globalSecound)
        console.log(timeval)
        console.log(trymidSecound)
    }
}

// 时分秒倒计时
function cardsecoundCoverMinute(dom, progressdom) {
    cardtimeSecound--;
    var hours = Math.floor(cardtimeSecound / (60 * 60)) + '';
    if (hours.length == 1) {
        hours = '0' + hours;
    }
    var mins = (Math.floor((cardtimeSecound / 60) % 60)) + '';
    if (mins.length == 1) {
        mins = '0' + mins;
    }
    var secs = Math.floor(cardtimeSecound % 60) + '';
    if (secs.length == 1) {
        secs = '0' + secs;
    }
    $(dom).html(hours + ':' + mins + ':' + secs);

    //进度条宽度  
    var num = parseFloat(100 / (cardmidSecound))
    cardprogress_width = cardprogress_width + num;
    $(progressdom).css('width', cardprogress_width + '%');
    if (cardtimeSecound == 0) {
        showTimeBool = false
        console.log('播放结束')
        clearInterval(cardTimer);
        clearInterval(beatTimer);
        clearInterval(preTimer);
        $(".start").hide()
        $(".stop").show()
        $(".imggif").hide()
        $(".imgpng").show()

        var _audio = $('#audioPlay1')[0]
        _audio.pause();
        _audio.currentTime =0;
        initialTime = null;

        if (isDemoMode) {
            // 演示模式：等最后一个和弦播完，然后生成作品
            setTimeout(function() {
                demoStopChords();
                closelightFun();
                // 自动生成并播放用户的作品
                demoGenerateAndPlay();
            }, beatTime * 4 * 1000);
        } else {
            closelightFun()
            $('.loadingbox').show()
            uploadFun()
        }
        return;
    }
}

let globalSecound, clearId = '', progress_width = 0, trymidSecound;
// 获取(试听)mid文件时长
function getmidTime(mid_url, dom) {
    MIDIjs.get_duration(mid_url, function (seconds) {
        globalSecound = Math.round(seconds)
        var timeval = swtchtime(globalSecound)
        $(dom).html(timeval);
        trymidSecound = Math.round(seconds)
    })
}

// 时分秒倒计时
function secoundCoverMinute(dom, progressdom) {
    globalSecound--;
    var hours = Math.floor(globalSecound / (60 * 60)) + '';
    if (hours.length == 1) {
        hours = '0' + hours;
    }
    var mins = (Math.floor((globalSecound / 60) % 60)) + '';
    if (mins.length == 1) {
        mins = '0' + mins;
    }
    var secs = Math.floor(globalSecound % 60) + '';
    if (secs.length == 1) {
        secs = '0' + secs;
    }
    $(dom).html(hours + ':' + mins + ':' + secs);

    //进度条宽度  
    var num = parseFloat(100 / (trymidSecound))
    progress_width = progress_width + num;
    $(progressdom).css('width', progress_width + '%');

    if (globalSecound == 0) {
        clearInterval(clearId);
        $(".trystartbox").hide()
        $(".trystopbox").show()
        return;
    }
}

let preTime=0;
let preTimer=null;
let pre_data=[]
// 准备倒计时
function preTimeFun(){
    submitarr = []
    initialTime = new Date().getTime()
    var _audio = $('#audioPlay1')[0]

    $(".start").show()
    $(".stop").hide()
    $(".imggif").show()
    $(".imgpng").hide();

    /*重头开始播放处理 */
    $(".cardprogress").css('width', '0%');

    if (isDemoMode) {
        // 演示模式：用JZZ.js实时合成和弦伴奏
        // 总时长 = 2小节准备时间 + 和弦进行总时长
        var prepBars = 2;
        var totalBars = lightarr.length + prepBars;
        var totalSeconds = totalBars * beatTime * 4;
        cardtimeSecound = Math.round(totalSeconds);
        cardmidSecound = cardtimeSecound;
        $('#time').html(swtchtime(cardtimeSecound));
        cardprogress_width = 0;
        cardTimer = setInterval("cardsecoundCoverMinute('#time','.cardprogress')", 1000);

        // 2小节准备时间（静音倒计时）
        showTimeBool = true;
        // 演示模式不显示"正在试听和弦"弹窗，只显示倒计时数字
        $("#tip_dom").hide();
        $('.tip_modal').show();

        var firstChord = lightarr[0];
        $('.toplefttext-item').html('准备：' + firstChord.chord);
        $('#chord_current').html('准备中…');

        var prepSeconds = Math.round(beatTime * 4 * 2); // 2小节准备时间
        var countdown = prepSeconds;
        $('.tip_modal').html(countdown.toString());

        preTimer = setInterval(function() {
            countdown--;
            if (countdown > 0) {
                $('.tip_modal').html(countdown.toString());
            } else {
                clearInterval(preTimer);
                $('.tip_modal').html('GO!');
                setTimeout(function() {
                    $('.tip_modal').hide();
                    $('#tip_dom').hide();
                }, 800);
                showTimeBool = false;
                // 正式开始播放和弦进行
                demoPlayChordProgression();
            }
        }, 1000);

    } else {
        // 正常模式：播放MP3
        musicTimeFun(playmid_url,_audio.duration,'#time','card')
        cardprogress_width = 0
        cardTimer = setInterval("cardsecoundCoverMinute('#time','.cardprogress')", 1000);
        lightFun(1, lightarr)

        // 播放和弦伴奏音频
        _audio.currentTime = 0;
        var playPromise = _audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(function(e) {
                console.log('音频播放被阻止，请手动点击音频播放', e);
            });
        }

        // 如果有前奏数据，显示倒计时提示
        if (pre_data && pre_data.length > 0) {
            $("#tip_dom").css({ display: 'flex' })
            preTimer = setInterval("showpreTimeFun()", 1000);
        } else {
            // 没有前奏数据，直接解锁钢琴
            showTimeBool = false;
        }
    }
}

// 倒计时数据回显处理
function showpreTimeFun(){
    if (!pre_data || pre_data.length < 2) {
        clearInterval(preTimer);
        showTimeBool = false;
        $('.tip_modal').hide();
        return;
    }
    preTime++;
    let timeDiff=(pre_data[1].endRealTime - pre_data[1].beginRealTime) /4;
    if((preTime*1000)==pre_data[0].endRealTime){
        $('#tip_dom').hide()
        $('.toplefttext-item').html(lightarr[0].chord)
        lightShow()
        $('.tip_modal').html("3")
        $('.tip_modal').show()
    }else if((preTime*1000)>=(pre_data[1].beginRealTime+timeDiff) && (preTime*1000) < (pre_data[1].beginRealTime+(2*timeDiff))){
        $('.tip_modal').html("2")
        lightShow()
    }else if((preTime*1000)>=(pre_data[1].beginRealTime+(2*timeDiff)) && (preTime*1000) < (pre_data[1].beginRealTime+(3*timeDiff))){
        $('.tip_modal').html("1")
        lightShow()
    }else if((preTime*1000)>=(pre_data[1].beginRealTime+(3*timeDiff)) && (preTime*1000) < pre_data[pre_data.length-1].endRealTime){
        $('.tip_modal').html("GO")
        lightShow()
    }
    if(preTime *1000 >= pre_data[pre_data.length-1].endRealTime){
        clearInterval(preTimer);
        console.log('倒计时结束')
        $('.tip_modal').hide()
        showTimeBool = false
        return
    }
}

// 卡片播放音乐
$(".stop").click(() => {
    $('.toplefttext-item').html('———')
    // 倒计时准备
    preTime=0;
    preTimer=null;
    preTimeFun()
})

// 音乐暂停播放
$(".start").click(function () {
    $('.toplefttext-item').html('———')

    if (isDemoMode) {
        // 演示模式：停止JZZ和弦播放
        demoStopChords();
    } else {
        var _audio = $('#audioPlay1')[0]
        _audio.pause();
        musicTimeFun(playmid_url,_audio.duration,'#time','card')
        _audio.currentTime =0;
    }

    $(".start").hide()
    $(".stop").show()
    $(".imggif").hide()
    $(".imgpng").show()
    $(".tip_modal").hide()
    showTimeBool = false
    /*重头开始播放处理 */
    clearInterval(cardTimer);
    clearInterval(beatTimer);
    clearInterval(preTimer);
    $(".cardprogress").css('width', '0%');
    showTimeObj.time = 0
    initialTime = null;
    closelightFun()
})


// 横屏处理
var detectOrient = function () {
    var width = document.documentElement.clientWidth,
        height = document.documentElement.clientHeight,
        wrapper = document.getElementById("app"),
        wrapper2 = document.getElementById("tip_dom"),
        wrapper3 = document.getElementById("tip_modal"),
        style = "";
        style2 = '';
    if (width >= height) { // 竖屏
        style += "width:100%";
        style += "height:100%;";
        style += "-webkit-transform: rotate(0); transform: rotate(0);";
        style += "-webkit-transform-origin: 0 0;";
        style += "transform-origin: 0 0;";
        style2 += 'width:100%;'
        style2 += 'height:100%;'
        style2 += 'line-height:' + height + "px"
    } else { // 横屏
        style += "width:" + height + "px;";// 注意旋转后的宽高切换
        style += "height:" + width + "px;";
        style += "-webkit-transform: rotate(90deg); transform: rotate(90deg);";
        // 注意旋转中点的处理
        style += "-webkit-transform-origin: " + width / 2 + "px " + width / 2 + "px;";
        style += "transform-origin: " + width / 2 + "px " + width / 2 + "px;";
        style += 'font-size:16px;';
        style2 += style
        style2 += 'line-height:' + width + 'px'
    }
    wrapper.style.cssText = style;
    wrapper2.style.cssText = style;
    wrapper3.style.cssText = style2;
    if(height <= 320){
        $('.apppianowrap').css({'height':'55%'})
    }
}
window.onresize = detectOrient;
detectOrient();

// 判断是移动端还是pc端
function judgepageFun() {
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        return 'mobile'
    } else {
        return 'pc'
    }
}

// 获取路由对应值的参数
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

// 秒转时分秒
function swtchtime(globalSecound) {
    var hours = Math.floor(globalSecound / (60 * 60)) + '';
    if (hours.length == 1) {
        hours = '0' + hours;
    }
    var mins = (Math.floor((globalSecound / 60) % 60)) + '';
    if (mins.length == 1) {
        mins = '0' + mins;
    }
    var secs = Math.floor(globalSecound % 60) + '';
    if (secs.length == 1) {
        secs = '0' + secs;
    }

    var result = hours + ':' + mins + ':' + secs
    return result
}