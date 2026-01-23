// 초기화 및 모바일 높이 보정
function resetHeight() { document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`); }

function playHaptic() { if ("vibrate" in navigator) navigator.vibrate(40); }

function applyDucking(isDucking) {
    if (!bgGainNode|| !audioCtx) return;

    const now = audioCtx.currentTime;
    if (isDucking) {
        // 0.2초 동안 볼륨을 0.1(10%)로 부드럽게 낮춤
        bgGainNode.gain.linearRampToValueAtTime(0.1, now + 0.2);
    } else {
        // 0.5초 동안 원래 볼륨(0.5)으로 부드럽게 복구
        bgGainNode.gain.linearRampToValueAtTime(0.5, now + 0.5);
    }
}

// 틱 버퍼 생성기
function createTickBuffer(seconds) {
    const combined = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate);
    const tickData = tickBuffer.getChannelData(0);
    const combinedData = combined.getChannelData(0);
    for (let i = 0; i < seconds; i++) combinedData.set(tickData, i * audioCtx.sampleRate);
    return combined;
}

function playGap() {
    const seconds = parseInt(gapInput.value) || 10;
    const source = audioCtx.createBufferSource();
    source.buffer = createTickBuffer(seconds);
    source.connect(audioCtx.destination);
    currentTickSource = source;

    source.onended = () => { 
        if (isPlaying && currentTickSource === source) 
            playExercise(currentIndex + 1); 
    };
    source.start(0);
}

// 운동 이름과 tick 소리를 멈춤.
function stopAllSounds() {
    if (currentSource) { 
        currentSource.onended = null; 
        try { currentSource.stop(); } 
        catch(e){} currentSource = null; 
    }
    if (currentTickSource) { 
        currentTickSource.onended = null; 
        try { currentTickSource.stop(); 
        } catch(e){} 
        currentTickSource = null; 
    }
}

function adjustFontSize(word) {
    const len = word.length;
    let size = len <= 6 ? 5 : len <= 10 ? 4 : len <= 15 ? 3.3 : 2.6;
    wordDisplay.style.fontSize = size + "rem";
}

// 인덱스 기반 재생 엔진
async function playExercise(index) {
    if (index < 0) index = 0;
    if (index >= shuffledWords.length) { finishRoutine(); return; }

    currentIndex = index;
    const word = shuffledWords[currentIndex];
    
    // UI 업데이트
    wordDisplay.innerText = word.toUpperCase();
    adjustFontSize(word);
    updateMediaMetadata(word.toUpperCase());
    status.innerText = `${currentIndex + 1} / ${shuffledWords.length} 진행 중`;

    // 이전 소리 중단
    stopAllSounds();

    // 멘트 시작 전 음악 볼륨 낮추기 (더킹 시작)
    applyDucking(true);

    const source = audioCtx.createBufferSource();
    source.buffer = decodedBuffersMap[word];
    source.connect(audioCtx.destination);
    currentSource = source;

    source.onended = () => { 
        // 멘트가 끝나면 음악 볼륨 다시 키우기 (더킹 해제)
        applyDucking(false);

        if (isPlaying && currentSource === source) playGap(); 
    };
    source.start(0);
    syncMediaPosition();
}

function updateMediaMetadata(word) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: word, artist: 'RopeFlow Workout', artwork: [{ src: ARTWORK_BASE64, type: 'image/png' }]
        });
    }
}

function syncMediaPosition() {
    if ('mediaSession' in navigator && 'setPositionState' in navigator && routineStartTime !== 0) {
        const elapsed = audioCtx.currentTime - routineStartTime;
        navigator.mediaSession.setPositionState({
            duration: totalDuration,
            playbackRate: audioCtx.state === 'running' ? 1 : 0,
            position: Math.min(Math.max(0, elapsed), totalDuration)
        });
    }
}

function finishRoutine() {
    isPlaying = false;
    stopAllSounds();
    wordDisplay.innerText = "FINISH!";
    playBtn.disabled = true;
    status.innerText = "운동이 완료되었습니다.";
}

function updateUI() {
    if (!isPlaying || !audioCtx || routineStartTime === 0) return;
    if (audioCtx.state === 'running') {
        const elapsed = audioCtx.currentTime - routineStartTime;
        document.getElementById('currentTime').innerText = formatTime(Math.max(0, elapsed));
    }
    requestAnimationFrame(updateUI);
}

function formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/*----------------------------------------------------------------------------------*/
function jump(direction) {
    if (!isPlaying) return;
    playHaptic();
    if (direction === 'next') playExercise(currentIndex + 1);
    else playExercise(currentIndex - 1);
}

if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => playBtn.click());
    navigator.mediaSession.setActionHandler('pause', () => playBtn.click());
    navigator.mediaSession.setActionHandler('previoustrack', () => jump('prev'));
    navigator.mediaSession.setActionHandler('nexttrack', () => jump('next'));
}
/*----------------------------------------------------------------------------------*/

