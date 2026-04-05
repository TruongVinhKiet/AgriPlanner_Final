// ============ VOICE SEARCH SYSTEM ============
// Voice recognition search widget - searches across crops, animals, and shop items
// Uses Web Speech API + Groq AI for enhanced matching

let voiceSearchState = {
    isOpen: false,
    isListening: false,
    recognition: null,
    currentTranscript: '',
    panelState: 'idle' // idle | listening | processing | results | not-found | error | unsupported
};

function initVoiceSearch() {
    injectVoiceSearchStyles();
    injectVoiceSearchUI();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        voiceSearchState.panelState = 'unsupported';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        const transcriptEl = document.getElementById('vs-transcript');
        if (transcriptEl) {
            if (finalTranscript) {
                transcriptEl.innerHTML = `<span class="text-gray-800 font-medium">${finalTranscript}</span>`;
                voiceSearchState.currentTranscript = finalTranscript;
            } else {
                transcriptEl.innerHTML = `<span class="text-gray-400 italic">${interimTranscript}</span>`;
            }
        }
    };

    recognition.onend = () => {
        voiceSearchState.isListening = false;
        updateVoiceToggleIcon();

        if (voiceSearchState.currentTranscript.trim()) {
            setVoiceSearchPanelState('processing');
            processVoiceSearch(voiceSearchState.currentTranscript.trim());
        } else {
            setVoiceSearchPanelState('idle');
        }
    };

    recognition.onerror = (event) => {
        voiceSearchState.isListening = false;
        updateVoiceToggleIcon();
        if (event.error === 'no-speech') {
            setVoiceSearchPanelState('idle');
            const statusEl = document.getElementById('vs-status-text');
            if (statusEl) statusEl.textContent = 'Không nghe thấy giọng nói. Thử lại?';
        } else if (event.error === 'not-allowed') {
            setVoiceSearchPanelState('error');
            const bodyEl = document.getElementById('vs-body');
            if (bodyEl) bodyEl.innerHTML = `
                <div class="flex flex-col items-center gap-3 py-6">
                    <span class="material-icons-round text-5xl text-red-400">mic_off</span>
                    <p class="text-gray-600 text-center text-sm">Trình duyệt chưa cho phép sử dụng microphone.<br>Vui lòng bật quyền truy cập micro.</p>
                </div>`;
        } else {
            setVoiceSearchPanelState('error');
        }
    };

    voiceSearchState.recognition = recognition;
}

function injectVoiceSearchStyles() {
    const style = document.createElement('style');
    style.id = 'voice-search-styles';
    style.textContent = `
        .vs-container {
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 9998;
            font-family: 'Manrope', sans-serif;
        }

        .vs-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2f7f34 0%, #4caf50 100%);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(47, 127, 52, 0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: visible;
        }

        .vs-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 28px rgba(47, 127, 52, 0.5);
        }

        .vs-toggle .material-icons-round {
            font-size: 28px;
            transition: transform 0.3s ease;
            position: relative;
            z-index: 2;
        }

        .vs-toggle.listening {
            background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);
            animation: vs-btn-glow 1.5s ease-in-out infinite;
        }

        @keyframes vs-btn-glow {
            0%, 100% { box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4); }
            50% { box-shadow: 0 4px 35px rgba(239, 68, 68, 0.7); }
        }

        .vs-pulse-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 3px solid rgba(239, 68, 68, 0.6);
            top: 0;
            left: 0;
            opacity: 0;
            pointer-events: none;
        }

        .vs-toggle.listening .vs-pulse-ring {
            animation: vs-pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .vs-pulse-ring:nth-child(2) { animation-delay: 0.5s; }
        .vs-pulse-ring:nth-child(3) { animation-delay: 1s; }

        @keyframes vs-pulse {
            0% { transform: scale(1); opacity: 0.7; }
            100% { transform: scale(2.5); opacity: 0; }
        }

        .vs-panel {
            position: absolute;
            bottom: 75px;
            right: 0;
            width: 400px;
            max-height: 520px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            pointer-events: none;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .vs-panel.open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

        .vs-header {
            background: linear-gradient(135deg, #1B5E20 0%, #2f7f34 100%);
            padding: 18px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .vs-header-title {
            display: flex;
            align-items: center;
            gap: 10px;
            color: white;
        }

        .vs-header-title h3 {
            font-size: 15px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.2px;
        }

        .vs-header-title .material-icons-round {
            font-size: 22px;
            opacity: 0.9;
        }

        .vs-close {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,0.15);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }

        .vs-close:hover {
            background: rgba(255,255,255,0.3);
        }

        .vs-body {
            padding: 20px;
            max-height: 420px;
            overflow-y: auto;
        }

        .vs-body::-webkit-scrollbar { width: 4px; }
        .vs-body::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

        /* Wave animation */
        .vs-wave-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            height: 50px;
            margin: 16px 0;
        }

        .vs-wave-bar {
            width: 4px;
            height: 10px;
            background: linear-gradient(180deg, #ef4444, #f97316);
            border-radius: 4px;
            animation: vs-wave 1s ease-in-out infinite;
        }

        .vs-wave-bar:nth-child(1) { animation-delay: 0s; }
        .vs-wave-bar:nth-child(2) { animation-delay: 0.1s; }
        .vs-wave-bar:nth-child(3) { animation-delay: 0.2s; }
        .vs-wave-bar:nth-child(4) { animation-delay: 0.3s; }
        .vs-wave-bar:nth-child(5) { animation-delay: 0.4s; }
        .vs-wave-bar:nth-child(6) { animation-delay: 0.3s; }
        .vs-wave-bar:nth-child(7) { animation-delay: 0.2s; }
        .vs-wave-bar:nth-child(8) { animation-delay: 0.1s; }
        .vs-wave-bar:nth-child(9) { animation-delay: 0s; }

        @keyframes vs-wave {
            0%, 100% { height: 10px; opacity: 0.5; }
            50% { height: 40px; opacity: 1; }
        }

        /* Processing spinner */
        .vs-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #2f7f34;
            border-radius: 50%;
            animation: vs-spin 0.8s linear infinite;
            margin: 20px auto;
        }

        @keyframes vs-spin {
            to { transform: rotate(360deg); }
        }

        /* Result items */
        .vs-result-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 16px;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 8px;
            border: 1px solid #f3f4f6;
            background: #fafafa;
            opacity: 0;
            transform: translateY(12px);
        }

        .vs-result-item:hover {
            background: #f0fdf4;
            border-color: #bbf7d0;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.12);
        }

        .vs-result-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            flex-shrink: 0;
        }

        .vs-result-icon.crop { background: #dcfce7; color: #16a34a; }
        .vs-result-icon.animal { background: #fee2e2; color: #dc2626; }
        .vs-result-icon.item { background: #dbeafe; color: #2563eb; }

        .vs-result-info {
            flex: 1;
            min-width: 0;
        }

        .vs-result-name {
            font-weight: 600;
            font-size: 14px;
            color: #1f2937;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .vs-result-type {
            font-size: 12px;
            color: #9ca3af;
        }

        .vs-result-arrow {
            color: #d1d5db;
            font-size: 20px;
            transition: color 0.2s, transform 0.2s;
        }

        .vs-result-item:hover .vs-result-arrow {
            color: #22c55e;
            transform: translateX(3px);
        }

        /* Mic big button in panel */
        .vs-mic-btn {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2f7f34 0%, #4caf50 100%);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 12px auto 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(47, 127, 52, 0.3);
        }

        .vs-mic-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 28px rgba(47, 127, 52, 0.4);
        }

        .vs-mic-btn.listening {
            background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
            animation: vs-btn-glow 1.5s ease-in-out infinite;
        }

        .vs-mic-btn .material-icons-round {
            font-size: 36px;
        }

        /* Tags */
        .vs-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
        }

        .vs-tag.crop { background: #dcfce7; color: #15803d; }
        .vs-tag.animal { background: #fee2e2; color: #b91c1c; }
        .vs-tag.item { background: #dbeafe; color: #1d4ed8; }

        /* Transcript display */
        .vs-transcript-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px 16px;
            min-height: 42px;
            margin-bottom: 16px;
            font-size: 14px;
            line-height: 1.5;
            transition: border-color 0.2s;
        }

        .vs-transcript-box.active {
            border-color: #ef4444;
            background: #fef2f2;
        }

        /* Single result card */
        .vs-single-result {
            text-align: center;
            padding: 10px 0;
        }

        .vs-single-icon {
            width: 72px;
            height: 72px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            margin: 0 auto 16px;
        }

        .vs-single-name {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 4px;
        }

        .vs-single-type {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 16px;
        }

        .vs-navigate-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 28px;
            background: linear-gradient(135deg, #2f7f34, #4caf50);
            color: white;
            border: none;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(47, 127, 52, 0.3);
        }

        .vs-navigate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(47, 127, 52, 0.4);
        }

        /* Badge/category label */
        .vs-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 12px;
        }

        /* Not Found State */
        .vs-not-found {
            text-align: center;
            padding: 16px 0;
        }

        .vs-not-found .material-icons-round {
            font-size: 56px;
            color: #d1d5db;
            margin-bottom: 12px;
        }

        /* Footer hint */
        .vs-footer {
            padding: 12px 20px;
            border-top: 1px solid #f3f4f6;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: #9ca3af;
        }

        .vs-footer .material-icons-round {
            font-size: 14px;
        }

        /* Tooltip for the toggle button */
        .vs-tooltip {
            position: absolute;
            right: 72px;
            top: 50%;
            transform: translateY(-50%);
            background: #1f2937;
            color: white;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
        }

        .vs-toggle:hover .vs-tooltip {
            opacity: 1;
        }

        .vs-tooltip::after {
            content: '';
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            border: 6px solid transparent;
            border-left-color: #1f2937;
            border-right: none;
        }

        /* Dark mode support */
        [data-theme="dark"] .vs-panel {
            background: #1a261b;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        [data-theme="dark"] .vs-body { color: #e2e8f0; }
        [data-theme="dark"] .vs-result-item {
            background: #1e3320;
            border-color: #2d4a2f;
        }
        [data-theme="dark"] .vs-result-item:hover {
            background: #254028;
            border-color: #3d6b40;
        }
        [data-theme="dark"] .vs-result-name { color: #f1f5f9; }
        [data-theme="dark"] .vs-transcript-box {
            background: #1e3320;
            border-color: #2d4a2f;
            color: #e2e8f0;
        }
        [data-theme="dark"] .vs-header {
            background: linear-gradient(135deg, #0d3310 0%, #1B5E20 100%);
        }
    `;
    document.head.appendChild(style);
}

function injectVoiceSearchUI() {
    const container = document.createElement('div');
    container.className = 'vs-container';
    container.id = 'voice-search-container';
    container.innerHTML = `
        <div class="vs-panel" id="vs-panel">
            <div class="vs-header">
                <div class="vs-header-title">
                    <span class="material-icons-round">record_voice_over</span>
                    <h3>Tìm kiếm bằng giọng nói</h3>
                </div>
                <button class="vs-close" onclick="toggleVoicePanel()">
                    <span class="material-icons-round" style="font-size:18px">close</span>
                </button>
            </div>
            <div class="vs-body" id="vs-body"></div>
            <div class="vs-footer">
                <span class="material-icons-round">info</span>
                Tìm cây trồng, vật nuôi & sản phẩm bằng giọng nói
            </div>
        </div>
        <button class="vs-toggle" id="vs-toggle" onclick="toggleVoicePanel()">
            <span class="material-icons-round">mic</span>
            <span class="vs-pulse-ring"></span>
            <span class="vs-pulse-ring"></span>
            <span class="vs-pulse-ring"></span>
            <span class="vs-tooltip">Tìm kiếm giọng nói</span>
        </button>
    `;
    document.body.appendChild(container);

    // Set initial body content
    setVoiceSearchPanelState('idle');
}

function toggleVoicePanel() {
    const panel = document.getElementById('vs-panel');
    const toggle = document.getElementById('vs-toggle');

    voiceSearchState.isOpen = !voiceSearchState.isOpen;

    if (voiceSearchState.isOpen) {
        panel.classList.add('open');
        // Animate in
        gsap.fromTo(panel, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.5)' });
        setVoiceSearchPanelState('idle');
    } else {
        // Stop listening if active
        if (voiceSearchState.isListening) {
            stopVoiceListening();
        }
        gsap.to(panel, {
            opacity: 0, y: 20, scale: 0.95, duration: 0.25, ease: 'power2.in',
            onComplete: () => panel.classList.remove('open')
        });
    }
}

function setVoiceSearchPanelState(state) {
    voiceSearchState.panelState = state;
    const body = document.getElementById('vs-body');
    if (!body) return;

    switch (state) {
        case 'idle':
            body.innerHTML = `
                <div class="flex flex-col items-center py-2">
                    <button class="vs-mic-btn" id="vs-mic-main" onclick="startVoiceListening()">
                        <span class="material-icons-round">mic</span>
                    </button>
                    <p id="vs-status-text" class="text-gray-500 text-sm mb-4">Nhấn để bắt đầu nói</p>
                    <div class="vs-transcript-box" id="vs-transcript" style="width:100%">
                        <span class="text-gray-400 text-sm">Nội dung nhận diện sẽ hiện ở đây...</span>
                    </div>
                    <div class="flex gap-2 flex-wrap justify-center">
                        <span class="vs-tag crop"><span class="material-icons-round" style="font-size:13px">eco</span> Cây trồng</span>
                        <span class="vs-tag animal"><span class="material-icons-round" style="font-size:13px">egg</span> Vật nuôi</span>
                        <span class="vs-tag item"><span class="material-icons-round" style="font-size:13px">storefront</span> Sản phẩm</span>
                    </div>
                </div>
            `;
            // Animate entry
            gsap.fromTo(body.children[0], { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
            break;

        case 'listening':
            const transcriptBox = document.getElementById('vs-transcript');
            if (transcriptBox) transcriptBox.classList.add('active');
            const statusText = document.getElementById('vs-status-text');
            if (statusText) statusText.textContent = 'Đang lắng nghe...';
            const micBtn = document.getElementById('vs-mic-main');
            if (micBtn) {
                micBtn.classList.add('listening');
                micBtn.querySelector('.material-icons-round').textContent = 'stop';
                micBtn.setAttribute('onclick', 'stopVoiceListening()');
            }

            // Add wave animation below mic
            const waveHTML = `<div class="vs-wave-container" id="vs-wave">
                ${Array.from({ length: 9 }, () => '<div class="vs-wave-bar"></div>').join('')}
            </div>`;
            if (statusText) statusText.insertAdjacentHTML('afterend', waveHTML);
            break;

        case 'processing':
            body.innerHTML = `
                <div class="flex flex-col items-center py-8">
                    <div class="vs-spinner"></div>
                    <p class="text-gray-500 text-sm mt-4">Đang tìm kiếm dữ liệu...</p>
                    <p class="text-gray-400 text-xs mt-1">"${voiceSearchState.currentTranscript}"</p>
                </div>
            `;
            gsap.fromTo(body.children[0], { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3 });
            break;

        case 'error':
            body.innerHTML = `
                <div class="flex flex-col items-center gap-3 py-6">
                    <span class="material-icons-round text-5xl text-red-400">error_outline</span>
                    <p class="text-gray-600 text-center text-sm">Đã xảy ra lỗi nhận diện giọng nói.</p>
                    <button onclick="setVoiceSearchPanelState('idle')" class="text-sm text-primary font-medium hover:underline mt-2">Thử lại</button>
                </div>
            `;
            break;

        case 'unsupported':
            body.innerHTML = `
                <div class="flex flex-col items-center gap-3 py-6">
                    <span class="material-icons-round text-5xl text-amber-400">warning</span>
                    <p class="text-gray-600 text-center text-sm">Trình duyệt không hỗ trợ nhận diện giọng nói.<br>Vui lòng sử dụng Chrome hoặc Edge.</p>
                </div>
            `;
            break;
    }
}

function startVoiceListening() {
    if (voiceSearchState.panelState === 'unsupported') return;
    if (voiceSearchState.isListening) {
        stopVoiceListening();
        return;
    }

    voiceSearchState.currentTranscript = '';
    voiceSearchState.isListening = true;

    setVoiceSearchPanelState('listening');
    updateVoiceToggleIcon();

    try {
        voiceSearchState.recognition.start();
    } catch (e) {
        // Recognition already started
        voiceSearchState.recognition.stop();
        setTimeout(() => {
            voiceSearchState.recognition.start();
        }, 100);
    }
}

function stopVoiceListening() {
    voiceSearchState.isListening = false;
    updateVoiceToggleIcon();
    try {
        voiceSearchState.recognition.stop();
    } catch (e) { /* ignore */ }
}

function updateVoiceToggleIcon() {
    const toggleBtn = document.getElementById('vs-toggle');
    if (!toggleBtn) return;
    const icon = toggleBtn.querySelector('.material-icons-round');

    if (voiceSearchState.isListening) {
        toggleBtn.classList.add('listening');
        icon.textContent = 'hearing';
    } else {
        toggleBtn.classList.remove('listening');
        icon.textContent = 'mic';
    }
}

async function ensureDataLoaded() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const fetchData = async (url) => {
        try {
            const res = await fetch(url, { headers });
            if (res.ok) return await res.json();
            return [];
        } catch { return []; }
    };

    const promises = [];
    if (!cropsData || cropsData.length === 0) {
        promises.push(fetchData(`${API_BASE_URL}/admin/crops`).then(d => { cropsData = d || []; }));
    }
    if (!itemsData || itemsData.length === 0) {
        promises.push(fetchData(`${API_BASE_URL}/admin/shop-items`).then(d => { itemsData = d || []; }));
    }
    if (!animalsData || animalsData.length === 0) {
        promises.push(fetchData(`${API_BASE_URL}/admin/animals`).then(d => { animalsData = d || []; }));
    }
    if (promises.length > 0) await Promise.all(promises);
}

function normalizeVietnamese(str) {
    if (!str) return '';
    return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

function fuzzyMatchData(query) {
    const normalizedQuery = normalizeVietnamese(query);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    const results = [];

    const matchAgainst = (dataArray, type) => {
        if (!dataArray) return;
        dataArray.forEach(item => {
            const name = item.name || '';
            const normalizedName = normalizeVietnamese(name);
            const category = normalizeVietnamese(item.category || item.type || '');

            let score = 0;

            // Exact match (highest priority)
            if (normalizedName === normalizedQuery) {
                score = 100;
            }
            // Name contains full query
            else if (normalizedName.includes(normalizedQuery)) {
                score = 85;
            }
            // Query contains full name
            else if (normalizedQuery.includes(normalizedName)) {
                score = 80;
            }
            // Word-level matching
            else {
                const nameWords = normalizedName.split(/\s+/);
                let matchedWords = 0;
                let partialMatches = 0;

                queryWords.forEach(qw => {
                    if (nameWords.some(nw => nw === qw)) {
                        matchedWords++;
                    } else if (nameWords.some(nw => nw.includes(qw) || qw.includes(nw))) {
                        partialMatches++;
                    }
                });

                // Also check reverse: name words found in query
                nameWords.forEach(nw => {
                    if (queryWords.some(qw => qw === nw)) {
                        matchedWords++;
                    } else if (queryWords.some(qw => qw.includes(nw) || nw.includes(qw))) {
                        partialMatches++;
                    }
                });

                matchedWords = matchedWords / 2; // Deduplicate bidirectional matches
                partialMatches = partialMatches / 2;

                if (matchedWords > 0) {
                    score = 40 + (matchedWords / Math.max(queryWords.length, nameWords.length)) * 40;
                }
                if (partialMatches > 0 && score < 30) {
                    score = Math.max(score, 20 + partialMatches * 10);
                }
            }

            // Category bonus
            if (category && queryWords.some(qw => category.includes(qw))) {
                score += 5;
            }

            if (score >= 20) {
                results.push({ ...item, type, score, displayName: name });
            }
        });
    };

    matchAgainst(cropsData, 'crop');
    matchAgainst(animalsData, 'animal');
    matchAgainst(itemsData, 'item');

    results.sort((a, b) => b.score - a.score);
    return results;
}

async function aiEnhancedMatch(transcript) {
    const allNames = [
        ...cropsData.map(c => ({ name: c.name, type: 'crop', id: c.id })),
        ...animalsData.map(a => ({ name: a.name, type: 'animal', id: a.id })),
        ...itemsData.map(i => ({ name: i.name, type: 'item', id: i.id }))
    ];

    const nameList = allNames.map(n => `${n.name} (${n.type})`).join(', ');

    try {
        const response = await fetch(CONFIG.GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.GROQ_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Bạn là hệ thống nhận diện tên dữ liệu nông nghiệp. Người dùng sẽ nói một câu bằng tiếng Việt để tìm kiếm. Hãy trích xuất tên cây trồng, vật nuôi, hoặc sản phẩm mà họ muốn tìm.

Danh sách dữ liệu hiện có: ${nameList}

Trả lời ngắn gọn CHÍNH XÁC tên dữ liệu phù hợp nhất (có thể nhiều tên, cách nhau bởi dấu |). Nếu không tìm thấy phù hợp, trả lời "NONE".
Chỉ trả lời tên, không giải thích.`
                    },
                    {
                        role: 'user',
                        content: transcript
                    }
                ],
                temperature: 0.1,
                max_tokens: 100
            })
        });

        if (!response.ok) return [];

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content?.trim();

        if (!aiResponse || aiResponse === 'NONE') return [];

        const aiNames = aiResponse.split('|').map(n => n.trim()).filter(n => n.length > 0);
        const matches = [];

        aiNames.forEach(aiName => {
            const normalizedAI = normalizeVietnamese(aiName);
            allNames.forEach(item => {
                const normalizedItem = normalizeVietnamese(item.name);
                if (normalizedItem === normalizedAI || normalizedItem.includes(normalizedAI) || normalizedAI.includes(normalizedItem)) {
                    const fullData = item.type === 'crop' ? cropsData.find(c => c.id === item.id)
                        : item.type === 'animal' ? animalsData.find(a => a.id === item.id)
                            : itemsData.find(i => i.id === item.id);
                    if (fullData && !matches.some(m => m.id === item.id && m.type === item.type)) {
                        matches.push({ ...fullData, type: item.type, score: 90, displayName: item.name });
                    }
                }
            });
        });

        return matches;
    } catch (e) {
        console.warn('AI enhanced match failed:', e);
        return [];
    }
}

async function processVoiceSearch(transcript) {
    await ensureDataLoaded();

    // Step 1: Fuzzy match
    let results = fuzzyMatchData(transcript);

    // Step 2: If no good matches, try AI-enhanced matching
    if (results.length === 0 || (results.length > 0 && results[0].score < 40)) {
        const aiResults = await aiEnhancedMatch(transcript);
        if (aiResults.length > 0) {
            // Merge and deduplicate
            const existingIds = new Set(results.map(r => `${r.type}-${r.id}`));
            aiResults.forEach(ar => {
                if (!existingIds.has(`${ar.type}-${ar.id}`)) {
                    results.push(ar);
                }
            });
            results.sort((a, b) => b.score - a.score);
        }
    }

    // Filter to decent matches
    results = results.filter(r => r.score >= 20).slice(0, 10);

    if (results.length === 0) {
        renderVoiceNoResults(transcript);
    } else if (results.length === 1) {
        renderVoiceSingleResult(results[0]);
    } else {
        renderVoiceMultipleResults(results, transcript);
    }
}

function getTypeIcon(type) {
    switch (type) {
        case 'crop': return 'eco';
        case 'animal': return 'egg';
        case 'item': return 'storefront';
        default: return 'category';
    }
}

function getTypeName(type) {
    switch (type) {
        case 'crop': return 'Cây trồng';
        case 'animal': return 'Vật nuôi';
        case 'item': return 'Sản phẩm';
        default: return 'Dữ liệu';
    }
}

function renderVoiceNoResults(transcript) {
    const body = document.getElementById('vs-body');
    if (!body) return;

    body.innerHTML = `
        <div class="vs-not-found">
            <span class="material-icons-round">search_off</span>
            <p class="text-gray-700 font-semibold text-base mb-1">Không tìm thấy kết quả</p>
            <p class="text-gray-400 text-sm mb-4">Cho "${transcript}"</p>
            <div class="flex flex-col gap-2 text-left bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
                <p class="font-medium text-gray-600 mb-1">💡 Gợi ý:</p>
                <p>• Nói rõ tên cây trồng, vật nuôi hoặc sản phẩm</p>
                <p>• Ví dụ: "Lúa nước", "Gà", "Phân bón"</p>
            </div>
            <button onclick="setVoiceSearchPanelState('idle')" class="mt-4 inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
                <span class="material-icons-round text-lg">replay</span> Thử lại
            </button>
        </div>
    `;

    gsap.fromTo(body.children[0], { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' });
}

function renderVoiceSingleResult(result) {
    const body = document.getElementById('vs-body');
    if (!body) return;

    const typeClass = result.type;
    const icon = getTypeIcon(result.type);
    const typeName = getTypeName(result.type);

    body.innerHTML = `
        <div class="vs-single-result">
            <div class="vs-single-icon ${typeClass}">
                <span class="material-icons-round">${icon}</span>
            </div>
            <div class="vs-badge ${typeClass}">${typeName}</div>
            <div class="vs-single-name">${result.displayName}</div>
            <div class="vs-single-type">${result.category || result.type || ''}</div>
            <button class="vs-navigate-btn" onclick="navigateVoiceResult('${result.type}', ${result.id})">
                <span class="material-icons-round" style="font-size:20px">open_in_new</span>
                Xem chi tiết
            </button>
            <div class="mt-4">
                <button onclick="setVoiceSearchPanelState('idle')" class="text-sm text-gray-400 hover:text-gray-600 font-medium">
                    <span class="material-icons-round text-lg align-middle">replay</span> Tìm kiếm khác
                </button>
            </div>
        </div>
    `;

    // Animate
    gsap.timeline()
        .fromTo('.vs-single-icon', { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' })
        .fromTo('.vs-single-name', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.2')
        .fromTo('.vs-navigate-btn', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.1');
}

function renderVoiceMultipleResults(results, transcript) {
    const body = document.getElementById('vs-body');
    if (!body) return;

    const resultsHTML = results.map((r, i) => `
        <div class="vs-result-item" data-idx="${i}" onclick="navigateVoiceResult('${r.type}', ${r.id})">
            <div class="vs-result-icon ${r.type}">
                <span class="material-icons-round">${getTypeIcon(r.type)}</span>
            </div>
            <div class="vs-result-info">
                <div class="vs-result-name">${r.displayName}</div>
                <div class="vs-result-type">${getTypeName(r.type)}${r.category ? ' • ' + r.category : ''}</div>
            </div>
            <span class="material-icons-round vs-result-arrow">chevron_right</span>
        </div>
    `).join('');

    body.innerHTML = `
        <div>
            <div class="flex items-center justify-between mb-3">
                <p class="text-gray-500 text-sm">Tìm thấy <strong class="text-gray-800">${results.length}</strong> kết quả</p>
                <button onclick="setVoiceSearchPanelState('idle')" class="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                    <span class="material-icons-round" style="font-size:15px">replay</span> Tìm lại
                </button>
            </div>
            <div class="vs-transcript-box mb-3" style="font-size:13px;">
                <span class="material-icons-round text-gray-400 align-middle" style="font-size:16px">format_quote</span>
                <span class="text-gray-600 italic">${transcript}</span>
            </div>
            <div id="vs-results-list">
                ${resultsHTML}
            </div>
        </div>
    `;

    // Stagger animation for results
    gsap.fromTo('#vs-results-list .vs-result-item',
        { opacity: 0, y: 20, scale: 0.95 },
        {
            opacity: 1, y: 0, scale: 1,
            duration: 0.35,
            stagger: 0.08,
            ease: 'power2.out'
        }
    );
}

function navigateVoiceResult(type, id) {
    // Close panel
    toggleVoicePanel();

    // Small delay for panel close animation
    setTimeout(() => {
        animateContentTransition(() => {
            switch (type) {
                case 'crop':
                    // First load crops page to set context, then show detail
                    showCropDetail(id);
                    break;
                case 'animal':
                    showAnimalDetail(id);
                    break;
                case 'item':
                    showItemDetail(id);
                    break;
            }
        });
    }, 300);
}

// ============ SETTINGS ============
function loadSettings() {
    document.getElementById('page-title').textContent = 'Cài đặt';
    const content = document.getElementById('main-content');
    const userName = localStorage.getItem('userName') || 'Admin';
    const userEmail = localStorage.getItem('userEmail') || '';

    content.innerHTML = `
    <div class="max-w-4xl mx-auto">
        <!-- Settings Navigation -->
        <div class="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
            <button class="admin-settings-nav active flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all" data-target="admin-profile-settings" onclick="switchAdminSettingsTab(this)">
                <span class="material-icons-round text-base align-middle mr-1">person</span> Hồ sơ
            </button>
            <button class="admin-settings-nav flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-gray-500 transition-all" data-target="admin-security-settings" onclick="switchAdminSettingsTab(this)">
                <span class="material-icons-round text-base align-middle mr-1">shield</span> Bảo mật
            </button>
            <button class="admin-settings-nav flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-gray-500 transition-all" data-target="admin-preferences-settings" onclick="switchAdminSettingsTab(this)">
                <span class="material-icons-round text-base align-middle mr-1">tune</span> Tùy chọn
            </button>
        </div>

        <!-- Profile Settings -->
        <div id="admin-profile-settings" class="admin-settings-section">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-primary">person</span> Thông tin cá nhân
                </h3>

                <!-- Avatar -->
                <div class="flex items-center gap-5 mb-8 p-5 bg-gray-50 rounded-xl">
                    <div id="admin-settings-avatar" class="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                         style="background-size:cover; background-position:center;">
                        ${userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800 text-lg">${userName}</p>
                        <p class="text-sm text-gray-500">${userEmail}</p>
                        <p class="text-xs text-primary font-medium mt-1">Quản trị viên hệ thống</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
                        <input type="text" id="admin-setting-name" value="${userName}" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                        <input type="email" id="admin-setting-email" value="${userEmail}" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" disabled>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
                        <input type="tel" id="admin-setting-phone" placeholder="Nhập số điện thoại" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ</label>
                        <input type="text" id="admin-setting-address" placeholder="Nhập địa chỉ" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button onclick="saveAdminProfile()" class="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-sm">
                        <span class="material-icons-round text-base align-middle mr-1">save</span> Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>

        <!-- Security Settings -->
        <div id="admin-security-settings" class="admin-settings-section" style="display:none;">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-primary">shield</span> Bảo mật tài khoản
                </h3>

                <div class="space-y-4">
                    <!-- Change Password -->
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <div class="font-semibold text-gray-800">Đổi mật khẩu</div>
                            <div class="text-sm text-gray-500">Cập nhật mật khẩu định kỳ để bảo mật</div>
                        </div>
                        <button onclick="showAdminChangePassword()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                            Thay đổi
                        </button>
                    </div>

                    <!-- 2FA -->
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <div class="font-semibold text-gray-800">Xác thực 2 bước (2FA)</div>
                            <div class="text-sm text-gray-500">Tăng cường bảo mật cho tài khoản</div>
                        </div>
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="admin-two-factor-toggle" class="sr-only peer">
                            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>

                    <!-- Face Login -->
                    <div class="p-4 bg-gray-50 rounded-xl border border-gray-100" style="display:flex; flex-direction:column; gap:12px;">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-semibold text-gray-800 flex items-center gap-2">
                                    <span class="material-icons-round" style="color:#8b5cf6; font-size:20px;">face</span>
                                    Đăng nhập bằng khuôn mặt
                                </div>
                                <div class="text-sm text-gray-500" id="admin-face-status-text">Đang kiểm tra...</div>
                            </div>
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="admin-face-login-toggle" class="sr-only peer">
                                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        <div id="admin-face-setup-panel" style="display:none; padding:16px; background:linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius:12px; border:1px solid #ddd6fe;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                                <div style="width:40px; height:40px; background:linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius:10px; display:flex; align-items:center; justify-content:center;">
                                    <span class="material-icons-round" style="color:white; font-size:22px;">face</span>
                                </div>
                                <div>
                                    <h4 style="margin:0; font-size:15px; font-weight:700; color:#5b21b6;">Đăng ký khuôn mặt</h4>
                                    <p style="margin:2px 0 0; font-size:12px; color:#7c3aed;">Chụp ảnh khuôn mặt để đăng nhập nhanh</p>
                                </div>
                            </div>

                            <div id="admin-face-setup-options" style="display:flex; gap:10px;">
                                <button onclick="adminStartFaceCamera()" class="px-4 py-2 rounded-lg text-white font-medium" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; background:#8b5cf6;">
                                    <span class="material-icons-round" style="font-size:18px;">videocam</span> Camera
                                </button>
                                <button onclick="adminUploadFacePhoto()" class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px;">
                                    <span class="material-icons-round" style="font-size:18px;">photo_camera</span> Tải ảnh
                                </button>
                                <input type="file" id="admin-face-setup-file" accept="image/*" style="display:none;">
                            </div>

                            <div id="admin-face-setup-camera" style="display:none; margin-top:12px;">
                                <video id="admin-face-setup-video" autoplay playsinline style="width:100%; border-radius:8px; background:#000;"></video>
                                <canvas id="admin-face-setup-canvas" style="display:none;"></canvas>
                                <p id="admin-face-setup-status" style="text-align:center; font-size:13px; color:#6b7280; margin-top:8px;">Đang tải...</p>
                                <div style="display:flex; gap:8px; margin-top:8px;">
                                    <button onclick="adminCaptureFaceSetup()" id="admin-btn-capture-setup" class="px-4 py-2 rounded-lg text-white font-medium" style="flex:1; background:#8b5cf6;" disabled>
                                        <span class="material-icons-round" style="font-size:18px; vertical-align:middle;">photo_camera</span> Chụp
                                    </button>
                                    <button onclick="adminStopFaceCamera()" class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium">
                                        <span class="material-icons-round" style="font-size:18px; vertical-align:middle;">close</span>
                                    </button>
                                </div>
                            </div>

                            <div id="admin-face-setup-processing" style="display:none; text-align:center; padding:16px;">
                                <span class="material-icons-round" style="font-size:36px; color:#8b5cf6; animation:spin 1s linear infinite;">face</span>
                                <p style="margin-top:8px; color:#6b7280; font-size:13px;">Đang xử lý khuôn mặt...</p>
                            </div>

                            <div id="admin-face-setup-success" style="display:none; text-align:center; padding:16px;">
                                <span class="material-icons-round" style="font-size:40px; color:#10b981;">check_circle</span>
                                <p style="margin-top:8px; color:#059669; font-weight:600; font-size:14px;">Đăng ký khuôn mặt thành công!</p>
                            </div>

                            <div style="margin-top:12px; padding:10px; background:white; border-radius:8px;">
                                <p style="font-size:11px; color:#7c3aed; margin:0; display:flex; align-items:center; gap:6px;">
                                    <span class="material-icons-round" style="font-size:14px;">info</span>
                                    Mỗi tài khoản chỉ đăng ký được một khuôn mặt duy nhất.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Active Sessions -->
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <div class="font-semibold text-gray-800">Phiên đăng nhập</div>
                            <div class="text-sm text-gray-500">Quản lý các thiết bị đang đăng nhập</div>
                        </div>
                        <button onclick="showAdminSessions()" class="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                            Xem tất cả
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Preferences -->
        <div id="admin-preferences-settings" class="admin-settings-section" style="display:none;">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span class="material-icons-round text-primary">tune</span> Tùy chọn hệ thống
                </h3>

                <div class="space-y-4">
                    <!-- Language -->
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <div class="font-semibold text-gray-800">Ngôn ngữ</div>
                            <div class="text-sm text-gray-500">Chọn ngôn ngữ hiển thị</div>
                        </div>
                        <select class="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="vi" selected>Tiếng Việt</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <!-- Notifications -->
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <div class="font-semibold text-gray-800">Thông báo</div>
                            <div class="text-sm text-gray-500">Nhận thông báo qua email</div>
                        </div>
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="admin-notifications-toggle" class="sr-only peer" checked>
                            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>

                    <!-- Auto Logout -->
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <div class="font-semibold text-gray-800">Tự động đăng xuất</div>
                            <div class="text-sm text-gray-500">Đăng xuất sau thời gian không hoạt động</div>
                        </div>
                        <select class="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="30">30 phút</option>
                            <option value="60" selected>1 giờ</option>
                            <option value="120">2 giờ</option>
                            <option value="0">Không bao giờ</option>
                        </select>
                    </div>

                    <!-- Data Export -->
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <div class="font-semibold text-gray-800">Sao lưu dữ liệu</div>
                            <div class="text-sm text-gray-500">Xuất dữ liệu hệ thống</div>
                        </div>
                        <button onclick="adminExportData()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                            <span class="material-icons-round text-base align-middle mr-1">download</span> Xuất dữ liệu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    // Init settings tab navigation style
    const activeBtn = document.querySelector('.admin-settings-nav.active');
    if (activeBtn) {
        activeBtn.style.background = '#10B981';
        activeBtn.style.color = 'white';
    }

    // Init face login
    initAdminFaceSetup();

    // Init 2FA toggle
    initAdmin2FA();

    // Load user profile data
    loadAdminProfileData();

    // Init preferences
    initAdminPreferences();

    // Animate
    gsap.fromTo('.admin-settings-section:not([style*="display:none"])',
        { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
}

function switchAdminSettingsTab(btn) {
    document.querySelectorAll('.admin-settings-nav').forEach(b => {
        b.classList.remove('active');
        b.style.background = '';
        b.style.color = '#6b7280';
    });
    btn.classList.add('active');
    btn.style.background = '#10B981';
    btn.style.color = 'white';

    const target = btn.dataset.target;
    document.querySelectorAll('.admin-settings-section').forEach(s => s.style.display = 'none');
    const section = document.getElementById(target);
    if (section) {
        section.style.display = 'block';
        gsap.fromTo(section, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    }

    // Re-init face setup when switching to security tab
    if (target === 'admin-security-settings') {
        initAdminFaceSetup();
    }
}

async function loadAdminProfileData() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
        const res = await fetch(API_BASE_URL + '/user/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            const data = await res.json();
            const nameInput = document.getElementById('admin-setting-name');
            const emailInput = document.getElementById('admin-setting-email');
            const phoneInput = document.getElementById('admin-setting-phone');
            const addressInput = document.getElementById('admin-setting-address');
            if (nameInput && data.fullName) nameInput.value = data.fullName;
            if (emailInput && data.email) emailInput.value = data.email;
            if (phoneInput && data.phone) phoneInput.value = data.phone;
            if (addressInput && data.address) addressInput.value = data.address;
        }
    } catch (e) { console.log('Could not load profile:', e); }
}

async function saveAdminProfile() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const name = document.getElementById('admin-setting-name')?.value;
    const phone = document.getElementById('admin-setting-phone')?.value;
    const address = document.getElementById('admin-setting-address')?.value;

    try {
        const res = await fetch(API_BASE_URL + '/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ fullName: name, phone, address })
        });
        if (res.ok) {
            localStorage.setItem('userName', name);
            document.getElementById('admin-name').textContent = name;
            showAdminToast('Đã lưu thông tin thành công!', 'success');
        } else {
            showAdminToast('Không thể lưu thông tin', 'error');
        }
    } catch {
        showAdminToast('Lỗi kết nối server', 'error');
    }
}

function showAdminChangePassword() {
    const mc = document.getElementById('modal-container');
    mc.innerHTML = `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick="if(event.target===this)this.remove()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="material-icons-round text-primary">lock</span> Đổi mật khẩu
            </h3>
            <p class="text-sm text-gray-500 mb-6">Hệ thống sẽ gửi mã OTP đến email của bạn để xác nhận.</p>
            <div class="flex justify-end gap-3">
                <button onclick="this.closest('.fixed').remove()" class="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">Hủy</button>
                <button onclick="adminRequestPasswordOtp()" class="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">Gửi mã OTP</button>
            </div>
        </div>
    </div>`;
}

async function adminRequestPasswordOtp() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
        const res = await fetch(API_BASE_URL + '/security/otp/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ type: 'PASSWORD_CHANGE' })
        });
        if (res.ok) {
            showAdminToast('Mã OTP đã gửi đến email của bạn', 'success');
            showAdminOtpPasswordModal();
        } else {
            showAdminToast('Không thể gửi mã OTP', 'error');
        }
    } catch {
        showAdminToast('Lỗi kết nối server', 'error');
    }
}

function showAdminOtpPasswordModal() {
    const mc = document.getElementById('modal-container');
    mc.innerHTML = `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick="if(event.target===this)this.remove()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span class="material-icons-round text-primary">lock</span> Xác thực & Đổi mật khẩu
            </h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Mã OTP (6 số)</label>
                    <input type="text" id="admin-otp-input" maxlength="6" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-center text-lg tracking-widest font-mono" placeholder="------">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
                    <input type="password" id="admin-new-password" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                    <input type="password" id="admin-confirm-password" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
                <button onclick="this.closest('.fixed').remove()" class="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">Hủy</button>
                <button onclick="submitAdminPasswordChange()" class="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">Đổi mật khẩu</button>
            </div>
        </div>
    </div>`;
}

async function submitAdminPasswordChange() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const otp = document.getElementById('admin-otp-input').value;
    const newPassword = document.getElementById('admin-new-password').value;
    const confirmPassword = document.getElementById('admin-confirm-password').value;

    if (!otp || otp.length !== 6) { showAdminToast('Vui lòng nhập mã OTP 6 số', 'error'); return; }
    if (!newPassword) { showAdminToast('Vui lòng nhập mật khẩu mới', 'error'); return; }
    if (newPassword !== confirmPassword) { showAdminToast('Mật khẩu mới không khớp', 'error'); return; }
    if (newPassword.length < 6) { showAdminToast('Mật khẩu phải ít nhất 6 ký tự', 'error'); return; }

    try {
        const res = await fetch(API_BASE_URL + '/security/password/change', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ otp, newPassword })
        });
        if (res.ok) {
            document.querySelector('#modal-container .fixed')?.remove();
            showAdminToast('Đổi mật khẩu thành công!', 'success');
        } else {
            const err = await res.json().catch(() => ({}));
            showAdminToast(err.message || 'Mã OTP không đúng hoặc đã hết hạn', 'error');
        }
    } catch {
        showAdminToast('Lỗi kết nối server', 'error');
    }
}

function showAdminToast(message, type = 'info') {
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; align-items:center; gap:10px; padding:14px 20px; background:white; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.12); border-left:4px solid ${colors[type]}; font-size:14px; font-weight:500; color:#1f2937; max-width:400px;`;
    toast.innerHTML = `<span class="material-icons-round" style="color:${colors[type]}; font-size:20px;">${icons[type]}</span>${message}`;
    document.body.appendChild(toast);
    gsap.fromTo(toast, { opacity: 0, y: 20, x: 20 }, { opacity: 1, y: 0, x: 0, duration: 0.3, ease: 'back.out(1.5)' });
    setTimeout(() => { gsap.to(toast, { opacity: 0, y: 20, duration: 0.2, onComplete: () => toast.remove() }); }, 3000);
}

// ============ ADMIN 2FA SETUP ============
function initAdmin2FA() {
    const toggle = document.getElementById('admin-two-factor-toggle');
    if (!toggle) return;

    // Check current 2FA status
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u.twoFactorEnabled) {
            toggle.checked = true;
        }
    } catch { }

    // Clone to remove old listeners  
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);

    newToggle.addEventListener('change', async function () {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (this.checked) {
            this.checked = false; // Wait for verification
            try {
                const res = await fetch(API_BASE_URL + '/security/2fa/init', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await res.json();
                showAdmin2FASetupModal(data.otpAuthUri, data.secret);
            } catch {
                showAdminToast('Không thể khởi tạo 2FA', 'error');
            }
        } else {
            showAdminDisable2FAModal(this);
        }
    });
}

function showAdmin2FASetupModal(otpAuthUri, secret) {
    const mc = document.getElementById('modal-container');
    mc.innerHTML = `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick="if(event.target===this)this.remove()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="material-icons-round text-primary">security</span> Thiết lập xác thực 2 bước
            </h3>
            <p class="text-sm text-gray-500 mb-4">Quét mã QR bên dưới bằng <strong>Google Authenticator</strong> hoặc ứng dụng tương tự:</p>
            <div class="flex justify-center mb-4">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUri)}" alt="QR Code" class="rounded-lg border border-gray-200" style="width:200px; height:200px;">
            </div>
            <p class="text-xs text-gray-400 text-center mb-4 break-all">Secret: <code class="bg-gray-100 px-2 py-0.5 rounded">${secret}</code></p>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nhập mã xác thực (6 số)</label>
                <input type="text" id="admin-2fa-code" maxlength="6" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-center text-lg tracking-widest font-mono" placeholder="------">
            </div>
            <div class="flex justify-end gap-3 mt-6">
                <button onclick="this.closest('.fixed').remove()" class="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50">Hủy</button>
                <button onclick="verifyAdmin2FA()" class="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark">Xác nhận</button>
            </div>
        </div>
    </div>`;
}

async function verifyAdmin2FA() {
    const code = document.getElementById('admin-2fa-code')?.value;
    if (!code || code.length !== 6) { showAdminToast('Vui lòng nhập mã 6 số', 'error'); return; }
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
        const res = await fetch(API_BASE_URL + '/security/2fa/enable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ code })
        });
        if (res.ok) {
            document.querySelector('#modal-container .fixed')?.remove();
            const toggle = document.getElementById('admin-two-factor-toggle');
            if (toggle) toggle.checked = true;
            // Update stored user
            try { const u = JSON.parse(localStorage.getItem('user') || '{}'); u.twoFactorEnabled = true; localStorage.setItem('user', JSON.stringify(u)); } catch { }
            showAdminToast('Đã bật xác thực 2 bước!', 'success');
        } else {
            showAdminToast('Mã xác thực không đúng', 'error');
        }
    } catch {
        showAdminToast('Lỗi kết nối server', 'error');
    }
}

function showAdminDisable2FAModal(toggleEl) {
    const mc = document.getElementById('modal-container');
    mc.innerHTML = `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick="if(event.target===this){document.getElementById('admin-two-factor-toggle').checked=true; this.remove();}">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="material-icons-round text-red-500">warning</span> Tắt xác thực 2 bước?
            </h3>
            <p class="text-sm text-gray-500 mb-6">Tài khoản của bạn sẽ kém an toàn hơn nếu tắt tính năng này.</p>
            <div class="flex justify-end gap-3">
                <button onclick="document.getElementById('admin-two-factor-toggle').checked=true; this.closest('.fixed').remove()" class="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50">Hủy</button>
                <button onclick="processAdminDisable2FA()" class="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600">Vẫn tắt</button>
            </div>
        </div>
    </div>`;
}

async function processAdminDisable2FA() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
        await fetch(API_BASE_URL + '/security/2fa/disable', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const toggle = document.getElementById('admin-two-factor-toggle');
        if (toggle) toggle.checked = false;
        try { const u = JSON.parse(localStorage.getItem('user') || '{}'); u.twoFactorEnabled = false; localStorage.setItem('user', JSON.stringify(u)); } catch { }
        document.querySelector('#modal-container .fixed')?.remove();
        showAdminToast('Đã tắt xác thực 2 bước', 'info');
    } catch {
        showAdminToast('Lỗi kết nối server', 'error');
    }
}

// ============ ADMIN SESSIONS ============
function showAdminSessions() {
    const mc = document.getElementById('modal-container');
    const currentBrowser = navigator.userAgent.includes('Edg') ? 'Microsoft Edge' :
        navigator.userAgent.includes('Chrome') ? 'Google Chrome' :
            navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Trình duyệt';
    const currentOS = navigator.userAgent.includes('Windows') ? 'Windows' :
        navigator.userAgent.includes('Mac') ? 'macOS' : 'Hệ điều hành';
    const loginTime = localStorage.getItem('loginTime') || new Date().toISOString();
    const timeAgo = getTimeAgo(loginTime);

    mc.innerHTML = `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick="if(event.target===this)this.remove()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
            <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span class="material-icons-round text-primary">devices</span> Phiên đăng nhập
            </h3>
            <div class="space-y-3">
                <div class="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span class="material-icons-round text-green-600">computer</span>
                    </div>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-800">${currentBrowser} - ${currentOS}</div>
                        <div class="text-xs text-gray-500">${timeAgo} • Phiên hiện tại</div>
                    </div>
                    <span class="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">Đang hoạt động</span>
                </div>
            </div>
            <div class="flex justify-end mt-6">
                <button onclick="this.closest('.fixed').remove()" class="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50">Đóng</button>
            </div>
        </div>
    </div>`;
}

function getTimeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return diffMins + ' phút trước';
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return diffHours + ' giờ trước';
    return Math.floor(diffHours / 24) + ' ngày trước';
}

// ============ ADMIN PREFERENCES ============
function initAdminPreferences() {
    // Notifications toggle
    const notifToggle = document.getElementById('admin-notifications-toggle');
    if (notifToggle) {
        const saved = localStorage.getItem('adminNotifications');
        if (saved !== null) notifToggle.checked = saved === 'true';

        const newToggle = notifToggle.cloneNode(true);
        notifToggle.parentNode.replaceChild(newToggle, notifToggle);
        newToggle.addEventListener('change', function () {
            localStorage.setItem('adminNotifications', this.checked);
            showAdminToast(this.checked ? 'Đã bật thông báo' : 'Đã tắt thông báo', 'success');
        });
    }

    // Auto-logout select
    const logoutSelect = document.getElementById('admin-auto-logout-select');
    if (logoutSelect) {
        const saved = localStorage.getItem('adminAutoLogout');
        if (saved !== null) logoutSelect.value = saved;

        logoutSelect.addEventListener('change', function () {
            localStorage.setItem('adminAutoLogout', this.value);
            showAdminToast('Đã cập nhật thời gian tự động đăng xuất', 'success');
        });
    }
}

function adminExportData() {
    showAdminToast('Đang chuẩn bị xuất dữ liệu...', 'info');
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    // Export all admin data as JSON
    Promise.all([
        fetch(API_BASE_URL + '/admin/users', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(API_BASE_URL + '/admin/crops', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(API_BASE_URL + '/admin/items', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(API_BASE_URL + '/admin/animals', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([users, crops, items, animals]) => {
        const exportData = {
            exportDate: new Date().toISOString(),
            summary: {
                totalUsers: users.length || 0,
                totalCrops: crops.length || 0,
                totalItems: items.length || 0,
                totalAnimals: animals.length || 0
            },
            users, crops, items, animals
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agriplanner_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showAdminToast('Xuất dữ liệu thành công!', 'success');
    }).catch(() => {
        showAdminToast('Lỗi khi xuất dữ liệu', 'error');
    });
}

// ============ ADMIN FACE LOGIN SETUP ============
let adminFaceStream = null;
let adminFaceDetectionLoop = null;
let adminFaceModelsLoaded = false;

const ADMIN_FACE_SERVICE_URL = 'http://localhost:5001';
const ADMIN_FACE_API_URL = 'http://localhost:8080/api/auth/face';

function getAdminToken() {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
}

function initAdminFaceSetup() {
    const toggle = document.getElementById('admin-face-login-toggle');
    const panel = document.getElementById('admin-face-setup-panel');
    const statusText = document.getElementById('admin-face-status-text');
    const fileInput = document.getElementById('admin-face-setup-file');
    if (!toggle || !panel) return;

    // Remove old listeners by cloning
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);

    // Check current face status via /api/auth/me
    const token = getAdminToken();
    if (token) {
        fetch('http://localhost:8080/api/auth/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(r => r.json())
            .then(data => {
                if (data.faceEnabled) {
                    newToggle.checked = true;
                    if (statusText) { statusText.textContent = 'Đã đăng ký khuôn mặt ✓'; statusText.style.color = '#10b981'; }
                } else {
                    newToggle.checked = false;
                    if (statusText) { statusText.textContent = 'Chưa kích hoạt'; statusText.style.color = '#6b7280'; }
                }
            })
            .catch(() => {
                if (statusText) { statusText.textContent = 'Không thể kiểm tra trạng thái'; statusText.style.color = '#ef4444'; }
            });
    }

    newToggle.addEventListener('change', function () {
        if (this.checked) {
            panel.style.display = 'block';
            const opts = document.getElementById('admin-face-setup-options');
            const cam = document.getElementById('admin-face-setup-camera');
            const proc = document.getElementById('admin-face-setup-processing');
            const succ = document.getElementById('admin-face-setup-success');
            if (opts) opts.style.display = 'flex';
            if (cam) cam.style.display = 'none';
            if (proc) proc.style.display = 'none';
            if (succ) succ.style.display = 'none';
        } else {
            agriConfirm('Tắt đăng nhập khuôn mặt', 'Bạn có chắc chắn muốn tắt đăng nhập bằng khuôn mặt?', () => {
                panel.style.display = 'none';
                adminStopFaceCamera();
                adminDisableFaceLogin();
            }, { confirmText: 'Tắt', type: 'danger', onCancel: () => { toggle.checked = true; } });
        }
    });

    if (fileInput) {
        const newFileInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);
        newFileInput.addEventListener('change', function (e) {
            if (e.target.files && e.target.files[0]) {
                adminRegisterFace(e.target.files[0]);
            }
        });
    }
}

async function adminLoadFaceModels() {
    if (adminFaceModelsLoaded) return true;
    try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        adminFaceModelsLoaded = true;
        return true;
    } catch (error) {
        console.error('Failed to load face models:', error);
        return false;
    }
}

window.adminStartFaceCamera = async function () {
    const camDiv = document.getElementById('admin-face-setup-camera');
    const video = document.getElementById('admin-face-setup-video');
    const statusEl = document.getElementById('admin-face-setup-status');
    const btnCapture = document.getElementById('admin-btn-capture-setup');
    const optionsDiv = document.getElementById('admin-face-setup-options');
    if (!camDiv || !video) return;

    if (optionsDiv) optionsDiv.style.display = 'none';
    camDiv.style.display = 'block';
    statusEl.textContent = 'Đang tải mô hình nhận diện...';
    btnCapture.disabled = true;

    const loaded = await adminLoadFaceModels();
    if (!loaded) {
        statusEl.textContent = 'Không thể tải mô hình nhận diện. Vui lòng thử tải ảnh lên.';
        statusEl.style.color = '#ef4444';
        setTimeout(() => {
            camDiv.style.display = 'none';
            if (optionsDiv) optionsDiv.style.display = 'flex';
        }, 3000);
        return;
    }

    try {
        adminFaceStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        video.srcObject = adminFaceStream;
        statusEl.textContent = 'Đưa khuôn mặt vào giữa camera...';
        statusEl.style.color = '#6b7280';
        video.onloadeddata = () => adminDetectFaceLoop();
    } catch (err) {
        statusEl.textContent = 'Không thể truy cập camera: ' + err.message;
        statusEl.style.color = '#ef4444';
    }
};

function adminDetectFaceLoop() {
    const video = document.getElementById('admin-face-setup-video');
    const statusEl = document.getElementById('admin-face-setup-status');
    const btnCapture = document.getElementById('admin-btn-capture-setup');

    if (!video || !adminFaceStream) return;

    faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).then(detection => {
        if (detection) {
            statusEl.innerHTML = '<span style="color:#10b981;">✓ Phát hiện khuôn mặt — Nhấn "Chụp"</span>';
            btnCapture.disabled = false;
        } else {
            statusEl.textContent = 'Đưa khuôn mặt vào giữa camera...';
            statusEl.style.color = '#6b7280';
            btnCapture.disabled = true;
        }
        if (adminFaceStream) {
            requestAnimationFrame(adminDetectFaceLoop);
        }
    }).catch(() => {
        if (adminFaceStream) {
            requestAnimationFrame(adminDetectFaceLoop);
        }
    });
}

window.adminCaptureFaceSetup = function () {
    const video = document.getElementById('admin-face-setup-video');
    const canvas = document.getElementById('admin-face-setup-canvas');
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    adminStopFaceCamera();

    document.getElementById('admin-face-setup-camera').style.display = 'none';
    document.getElementById('admin-face-setup-processing').style.display = 'block';

    canvas.toBlob(blob => {
        adminRegisterFace(blob);
    }, 'image/jpeg', 0.92);
};

window.adminUploadFacePhoto = function () {
    document.getElementById('admin-face-setup-file')?.click();
};

async function adminRegisterFace(imageBlob) {
    const optionsDiv = document.getElementById('admin-face-setup-options');
    const cameraDiv = document.getElementById('admin-face-setup-camera');
    const processingDiv = document.getElementById('admin-face-setup-processing');
    const successDiv = document.getElementById('admin-face-setup-success');
    const statusText = document.getElementById('admin-face-status-text');

    if (optionsDiv) optionsDiv.style.display = 'none';
    if (cameraDiv) cameraDiv.style.display = 'none';
    if (processingDiv) processingDiv.style.display = 'block';

    const token = getAdminToken();
    const userEmail = localStorage.getItem('userEmail') || '';

    try {
        // Step 1: Encode face via Python service
        const formData = new FormData();
        formData.append('file', imageBlob, 'face.jpg');

        const encodeRes = await fetch(ADMIN_FACE_SERVICE_URL + '/encode', {
            method: 'POST',
            body: formData
        });
        const encodeData = await encodeRes.json();

        if (!encodeData.success) {
            throw new Error(encodeData.error || 'Không thể nhận diện khuôn mặt');
        }

        // Step 2: Check uniqueness
        const uniqueRes = await fetch(ADMIN_FACE_SERVICE_URL + '/check-unique', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                encoding: encodeData.encoding,
                excludeEmail: userEmail
            })
        });
        const uniqueData = await uniqueRes.json();

        if (uniqueData.success && !uniqueData.unique) {
            throw new Error(uniqueData.message || 'Khuôn mặt đã được đăng ký cho tài khoản khác');
        }

        // Step 3: Upload image to backend
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageBlob, 'face.jpg');

        const uploadRes = await fetch(ADMIN_FACE_API_URL + '/upload', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: uploadFormData
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.success) {
            throw new Error(uploadData.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
        }

        // Step 4: Register face encoding in DB
        const registerRes = await fetch(ADMIN_FACE_API_URL + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                faceEncoding: JSON.stringify(encodeData.encoding),
                faceImagePath: uploadData.filePath || ''
            })
        });
        const registerData = await registerRes.json();

        if (registerData.success) {
            if (processingDiv) processingDiv.style.display = 'none';
            if (successDiv) successDiv.style.display = 'block';
            if (statusText) { statusText.textContent = 'Đã đăng ký khuôn mặt ✓'; statusText.style.color = '#10b981'; }
            showAdminToast('Đã đăng ký khuôn mặt thành công!', 'success');

            setTimeout(() => {
                const panel = document.getElementById('admin-face-setup-panel');
                if (panel) panel.style.display = 'none';
                if (successDiv) successDiv.style.display = 'none';
            }, 2500);
        } else {
            throw new Error(registerData.message || 'Đăng ký thất bại');
        }
    } catch (err) {
        console.error('Face registration error:', err);
        if (processingDiv) processingDiv.style.display = 'none';
        if (optionsDiv) optionsDiv.style.display = 'flex';
        adminShowFaceError(err.message || 'Không thể kết nối đến dịch vụ nhận diện khuôn mặt. Đảm bảo dịch vụ đang chạy (port 5001).');
    }
}

async function adminDisableFaceLogin() {
    const token = getAdminToken();
    const statusText = document.getElementById('admin-face-status-text');
    try {
        const res = await fetch(ADMIN_FACE_API_URL + '/disable', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (data.success) {
            if (statusText) { statusText.textContent = 'Chưa kích hoạt'; statusText.style.color = '#6b7280'; }
            showAdminToast('Đăng nhập bằng khuôn mặt đã được tắt', 'info');
        }
    } catch (e) {
        console.error('Disable face error:', e);
    }
}

window.adminStopFaceCamera = function () {
    if (adminFaceStream) { adminFaceStream.getTracks().forEach(t => t.stop()); adminFaceStream = null; }
};

function adminShowFaceError(msg) {
    const panel = document.getElementById('admin-face-setup-panel');
    if (!panel) return;
    let errDiv = document.getElementById('admin-face-setup-error');
    if (!errDiv) {
        errDiv = document.createElement('div');
        errDiv.id = 'admin-face-setup-error';
        errDiv.style.cssText = 'margin-top:10px; padding:10px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; color:#dc2626; font-size:13px; display:flex; align-items:center; gap:6px;';
        panel.appendChild(errDiv);
    }
    errDiv.innerHTML = '<span class="material-icons-round" style="font-size:16px;">error</span>' + msg;
    errDiv.style.display = 'flex';
    setTimeout(() => { errDiv.style.display = 'none'; }, 5000);
}

// ==================== FORCE CLOSE SESSION ====================

function showForceCloseModal(type, id, title) {
    const reason = prompt(`Bạn đang đóng sớm phiên "${title}".\nVui lòng nhập lý do:`);
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
        agriAlert('Vui lòng nhập lý do để kết thúc phiên', 'warning');
        return;
    }

    forceCloseSession(type, id, reason.trim());
}

async function forceCloseSession(type, id, reason) {
    try {
        const endpoint = type === 'buy'
            ? `/admin/trading/buy-sessions/${id}/force-close`
            : `/admin/trading/sell-sessions/${id}/force-close`;
        
        const response = await fetch(API_BASE_URL + endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: reason })
        });
        
        if (response.ok) {
            agriAlert('Đã đóng phiên thành công', 'success');
            // Reload the detail view to reflect new status
            viewSessionDetail(type, id);
        } else {
            const error = await response.json();
            agriAlert('Không thể đóng phiên: ' + (error.message || 'Lỗi hệ thống'), 'error');
        }
    } catch (error) {
        console.error('Error force closing session:', error);
        agriAlert('Không thể đóng phiên', 'error');
    }
}

// ==================== COMPLETE BUY SESSION ====================

function confirmCompleteBuySession(sessionId, title) {
    showConfirmModal(
        'Xác nhận Chốt Đơn',
        `Bạn có chắc chắn muốn chốt đơn phiên gom mua <br/><strong>${title}</strong>?<br/><br/><span class="text-sm text-gray-500">Hệ thống sẽ tự động trừ tiền từ quỹ của các HTX đã đăng ký và chuyển hàng vào kho của họ. Hành động này không thể hoàn tác.</span>`,
        () => completeBuySession(sessionId)
    );
}

async function completeBuySession(sessionId) {
    try {
        const response = await fetch(API_BASE_URL + `/admin/trading/buy-sessions/${sessionId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            agriAlert(result.message || 'Đã chốt đơn thành công', 'success');
            // Reload the buy sessions
            loadAdminGroupBuy();
        } else {
            const error = await response.json();
            agriAlert('Không thể chốt đơn: ' + (error.message || 'Lỗi hệ thống'), 'error');
        }
    } catch (error) {
        console.error('Error completing buy session:', error);
        agriAlert('Không thể chốt đơn', 'error');
    }
}

// ==================== COMPLETE SELL SESSION ====================

function promptCompleteSellSession(sessionId, title, minPrice) {
    const finalPriceStr = prompt(`Bạn đang chốt đơn thu gom nông sản "${title}".\nGiá thu mua tối thiểu lúc tạo phiên là: ${formatCurrency(minPrice)}\nVui lòng nhập GIÁ THU MUA CHÍNH THỨC trên mỗi đơn vị (VNĐ):`);
    
    if (finalPriceStr === null) return;
    
    const finalPrice = parseFloat(finalPriceStr.replace(/[^0-9.-]+/g,""));
    if (isNaN(finalPrice) || finalPrice <= 0) {
        agriAlert('Giá thu mua không hợp lệ', 'warning');
        return;
    }

    if (finalPrice < minPrice) {
        if (!confirm(`CẢNH BÁO: Giá chốt (${formatCurrency(finalPrice)}) ĐANG THẤP HƠN giá dự kiến ban đầu (${formatCurrency(minPrice)}).\nBạn có chắc chắn muốn tiếp tục?`)) {
            return;
        }
    }

    completeSellSession(sessionId, finalPrice);
}

async function completeSellSession(sessionId, finalPrice) {
    try {
        const response = await fetch(API_BASE_URL + `/admin/trading/sell-sessions/${sessionId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ finalPrice: finalPrice })
        });

        if (response.ok) {
            const result = await response.json();
            agriAlert(result.message || 'Đã chốt đơn thành công', 'success');
            loadAdminGroupSell();
        } else {
            const error = await response.json();
            agriAlert('Không thể chốt đơn: ' + (error.message || 'Lỗi hệ thống'), 'error');
        }
    } catch (error) {
        console.error('Error completing sell session:', error);
        agriAlert('Không thể chốt đơn', 'error');
    }
}
