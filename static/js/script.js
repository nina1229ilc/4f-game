// ========== 全域變數 ==========
let currentStage = 0;
let studentName = '';
let sentences = [];
let recognition = null;
let isRecording = false;

// 關卡資料（從伺服器載入或使用預設值）
const stages = [
    {
        id: 1,
        name: 'Facts',
        emoji: '📋',
        title: '第1關：事實',
        question: '今天這節課，你學到了什麼？',
        hint: '想想看，老師今天教了什麼內容？你記住了哪些重點？',
        placeholder: '例如：今天這節課，我學到了...',
        color: '#FF6B6B',
        fairyMsg: '太棒了！你記住了課堂的重點！ 🎉'
    },
    {
        id: 2,
        name: 'Feelings',
        emoji: '💭',
        title: '第2關：感受',
        question: '你覺得怎麼樣？有什麼感受？',
        hint: '開心、驚奇、感動、挑戰、有趣...說說你的心情！',
        placeholder: '例如：我覺得很有趣，因為...',
        color: '#4ECDC4',
        fairyMsg: '你的心情很重要！繼續加油！ 💪'
    },
    {
        id: 3,
        name: 'Findings',
        emoji: '🔍',
        title: '第3關：發現',
        question: '你發現了什麼？有什麼新想法？',
        hint: '這個讓你聯想到什麼？跟你之前知道的有什麼關係？',
        placeholder: '例如：我發現原來...',
        color: '#FFE66D',
        fairyMsg: '你真是個善於觀察的小偵探！ 🔍'
    },
    {
        id: 4,
        name: 'Future',
        emoji: '🚀',
        title: '第4關：未來',
        question: '下次你會怎麼做？有什麼新目標？',
        hint: '你想試試看什麼？想繼續學習什麼？',
        placeholder: '例如：下次我會...',
        color: '#95E1D3',
        fairyMsg: '完成所有關卡！你太厲害了！ 🏆'
    }
];

// ========== 語音辨識設定 ==========
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'zh-TW';
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = function(event) {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            const textarea = document.getElementById('answer-input');
            const currentText = textarea.value;
            
            if (finalTranscript) {
                // 只在最後不是空格時加空格
                const separator = currentText && !currentText.endsWith(' ') ? ' ' : '';
                textarea.value = currentText + separator + finalTranscript;
            }
        };
        
        recognition.onerror = function(event) {
            console.log('語音辨識錯誤：', event.error);
            stopVoice();
        };
        
        recognition.onend = function() {
            if (isRecording) {
                // 如果還在錄音狀態，重新開始
                try {
                    recognition.start();
                } catch (e) {
                    stopVoice();
                }
            }
        };
        
        return true;
    }
    return false;
}

// ========== 語音控制 ==========
function startVoice() {
    if (!recognition) {
        if (!initSpeechRecognition()) {
            alert('你的瀏覽器不支援語音辨識功能，請使用 Chrome 瀏覽器。');
            return;
        }
    }
    
    isRecording = true;
    recognition.start();
    
    document.getElementById('voice-btn').classList.add('recording');
    document.getElementById('voice-status').classList.remove('hidden');
}

function stopVoice() {
    isRecording = false;
    if (recognition) {
        recognition.stop();
    }
    
    document.getElementById('voice-btn').classList.remove('recording');
    document.getElementById('voice-status').classList.add('hidden');
}

// ========== 遊戲邏輯 ==========
function startGame() {
    studentName = document.getElementById('student-name').value.trim();
    if (!studentName) {
        alert('請先輸入你的名字！');
        document.getElementById('student-name').focus();
        return;
    }
    
    // 初始化句子陣列
    sentences = [''];
    currentStage = 0;
    
    // 切換到遊戲畫面
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // 載入第一關
    loadStage(0);
    
    // 初始化語音辨識
    initSpeechRecognition();
}

function loadStage(index) {
    currentStage = index;
    const stage = stages[index];
    
    // 更新進度條
    document.getElementById('progress-fill').style.width = ((index + 1) * 25) + '%';
    document.getElementById('current-stage').textContent = index + 1;
    
    // 更新關卡內容
    document.getElementById('stage-emoji').textContent = stage.emoji;
    document.getElementById('stage-title').textContent = stage.title;
    document.getElementById('stage-question').textContent = stage.question;
    document.getElementById('stage-hint').textContent = stage.hint;
    
    // 更新輸入框
    const textarea = document.getElementById('answer-input');
    textarea.placeholder = stage.placeholder;
    textarea.value = sentences[index] || '';
    textarea.style.borderColor = stage.color;
    
    // 更新按鈕
    document.getElementById('prev-btn').style.visibility = index > 0 ? 'visible' : 'hidden';
    
    if (index === stages.length - 1) {
        document.getElementById('next-btn').textContent = '完成挑戰！ 🎉';
    } else {
        document.getElementById('next-btn').textContent = '下一關 →';
    }
    
    // 更新小精靈
    document.getElementById('fairy-speech').textContent = stage.fairyMsg;
    
    // 動畫效果
    document.querySelector('.stage-emoji').style.animation = 'none';
    setTimeout(() => {
        document.querySelector('.stage-emoji').style.animation = 'bounce 1s ease infinite';
    }, 10);
}

function nextStage() {
    // 儲存目前輸入
    sentences[currentStage] = document.getElementById('answer-input').value.trim();
    
    // 檢查是否有輸入
    if (!sentences[currentStage]) {
        alert('請輸入你的答案再繼續！');
        document.getElementById('answer-input').focus();
        return;
    }
    
    if (currentStage < stages.length - 1) {
        // 下一關
        loadStage(currentStage + 1);
    } else {
        // 完成所有關卡
        showResult();
    }
}

function prevStage() {
    // 儲存目前輸入
    sentences[currentStage] = document.getElementById('answer-input').value.trim();
    
    if (currentStage > 0) {
        loadStage(currentStage - 1);
    }
}

// ========== 串接短文 ==========
function compileEssay() {
    // 確保所有句子都已儲存
    sentences[currentStage] = document.getElementById('answer-input').value.trim();
    
    // 串接成短文
    let essay = '';
    sentences.forEach((sentence, index) => {
        if (sentence) {
            // 確保句子以句號結尾
            let processedSentence = sentence;
            if (!processedSentence.endsWith('。') && !processedSentence.endsWith('！') && !processedSentence.endsWith('？')) {
                processedSentence += '。';
            }
            essay += processedSentence + ' ';
        }
    });
    
    return essay.trim();
}

// ========== 顯示成果 ==========
function showResult() {
    // 停止語音辨識
    stopVoice();
    
    const essay = compileEssay();
    
    // 切換到成果畫面
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    
    // 顯示學生姓名
    document.getElementById('result-name').textContent = studentName;
    
    // 顯示短文
    document.getElementById('essay-content').textContent = essay;
    
    // 顯示日期
    const now = new Date();
    document.getElementById('essay-date').textContent = now.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // 顯示四句話回顧
    const sentencesList = document.getElementById('sentences-list');
    sentencesList.innerHTML = '';
    
    stages.forEach((stage, index) => {
        if (sentences[index]) {
            const item = document.createElement('div');
            item.className = 'sentence-item';
            item.innerHTML = `
                <span class="sentence-emoji">${stage.emoji}</span>
                <div class="sentence-text">
                    <span class="sentence-label">${stage.title}</span>
                    ${sentences[index]}
                </div>
            `;
            sentencesList.appendChild(item);
        }
    });
    
    // 產生彩帶效果
    createConfetti();
    
    // 隱藏儲存訊息
    document.getElementById('save-message').classList.add('hidden');
}

// ========== 彩帶效果 ==========
function createConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';
    
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#a8edea', '#fed6e3'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        // 隨機形狀
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        } else {
            confetti.style.width = '15px';
            confetti.style.height = '8px';
        }
        
        container.appendChild(confetti);
    }
}

// ========== 複製短文 ==========
function copyEssay() {
    const essay = document.getElementById('essay-content').textContent;
    
    navigator.clipboard.writeText(essay).then(() => {
        alert('短文已複製到剪貼簿！');
    }).catch(err => {
        // 備用方案
        const textarea = document.createElement('textarea');
        textarea.value = essay;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('短文已複製到剪貼簿！');
    });
}

// ========== 儲存作品 ==========
function saveEssay() {
    const essay = compileEssay();
    
    fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: studentName,
            sentences: sentences,
            essay: essay
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 下載檔案
            const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            document.getElementById('save-message').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('save-message').classList.add('hidden');
            }, 3000);
        }
    })
    .catch(err => {
        console.error('儲存失敗：', err);
        alert('儲存失敗，請稍後再試！');
    });
}

// ========== 重新開始 ==========
function restartGame() {
    // 停止語音辨識
    stopVoice();
    
    // 重置變數
    currentStage = 0;
    sentences = [];
    studentName = '';
    
    // 切換回開始畫面
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
    
    // 清空輸入
    document.getElementById('student-name').value = '';
}

// ========== 頁面載入完成 ==========
document.addEventListener('DOMContentLoaded', function() {
    // 初始化語音辨識
    initSpeechRecognition();
    
    // 為 Enter 鍵添加事件
    document.getElementById('student-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startGame();
        }
    });
    
    // 為文字輸入框添加事件（自動儲存）
    document.getElementById('answer-input').addEventListener('input', function() {
        sentences[currentStage] = this.value;
    });
});
