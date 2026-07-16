// ========== 全域變數 ==========
let currentStage = 0;
let studentName = '';
let studentGrade = 0;
let sentences = [];
let recognition = null;
let isRecording = false;

// ========== 情緒選項資料庫 ==========
const feelingsDB = {
    positive: ['開心 😊', '興奮 🎉', '驚奇 ✨', '滿足 😌', '有趣 😄', '感動 💖'],
    challenge: ['有挑戰性 💪', '需要思考 🤔', '有點困難 😅', '想再試一次 🔄'],
    neutral: ['平静 🍃', '專注 🎯', '好奇 🧐']
};

// ========== 學習發現資料庫 ==========
const findingsDB = {
    general: ['原來如此！這跟我以前想的不一樣', '這個知識可以用在生活中', '我學會了一個新方法', '這跟其他科目有關係'],
    science: ['科學真有趣，可以做實驗', '大自然有很多奧秘', '觀察和實驗很重要'],
    language: ['閱讀可以學到很多東西', '寫作可以用不同的方式表達', '語言很有魅力'],
    math: ['數學可以用來解決問題', '數學就在我們身邊', '思考問題有很多方法'],
    social: ['歷史故事很有趣', '我們的生活跟環境有關係', '要關心我們的社會']
};

// ========== 未來目標資料庫 ==========
const futureDB = {
    general: ['下次我要更專心聽講', '我想繼續學習這個主題', '我要跟同學分享今天學到的', '下次我想問更多問題'],
    try_new: ['我想試試看今天學到的方法', '下次我想自己動手做做看', '我要把今天學到的用在生活中'],
    explore: ['我想探索更多相關的知識', '下次我想查更多資料', '我要找更多相關的書來看']
};

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

// ========== 年級選擇 ==========
function selectGrade(grade) {
    studentGrade = grade;
    // 更新按鈕樣式
    document.querySelectorAll('.grade-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.grade) === grade) {
            btn.classList.add('selected');
        }
    });
}

// ========== 參考答案生成 ==========
function getFeelingSuggestions(factText) {
    const suggestions = [];
    const text = factText.toLowerCase();
    
    // 根據事實內容推測可能的情緒
    if (text.includes('有趣') || text.includes('好玩') || text.includes('喜歡')) {
        suggestions.push(...feelingsDB.positive.slice(0, 2));
    } else if (text.includes('難') || text.includes('挑戰') || text.includes('不會')) {
        suggestions.push(...feelingsDB.challenge.slice(0, 2));
    } else {
        // 預設提供正向情緒選項
        suggestions.push(feelingsDB.positive[0], feelingsDB.neutral[2]);
    }
    
    return suggestions;
}

function getFindingsSuggestions(factText, feelingText) {
    const suggestions = [];
    const fact = factText.toLowerCase();
    const feeling = feelingText.toLowerCase();
    
    // 根據事實內容推測學習發現
    if (fact.includes('科學') || fact.includes('實驗') || fact.includes('自然')) {
        suggestions.push(...findingsDB.science.slice(0, 2));
    } else if (fact.includes('國語') || fact.includes('讀') || fact.includes('寫')) {
        suggestions.push(...findingsDB.language.slice(0, 2));
    } else if (fact.includes('數學') || fact.includes('計算') || fact.includes('數字')) {
        suggestions.push(...findingsDB.math.slice(0, 2));
    } else if (fact.includes('社會') || fact.includes('歷史') || fact.includes('生活')) {
        suggestions.push(...findingsDB.social.slice(0, 2));
    } else {
        suggestions.push(...findingsDB.general.slice(0, 2));
    }
    
    return suggestions;
}

function getFutureSuggestions(factText, feelingText, findingText) {
    const suggestions = [];
    
    // 根據前面的內容推測未來目標
    if (findingText.includes('想') || findingText.includes('試')) {
        suggestions.push(...futureDB.try_new.slice(0, 2));
    } else {
        suggestions.push(...futureDB.general.slice(0, 2));
    }
    
    return suggestions;
}

function showSuggestions(suggestions) {
    const container = document.getElementById('suggestions-container');
    container.innerHTML = '';
    
    if (suggestions.length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    const title = document.createElement('div');
    title.className = 'suggestions-title';
    title.textContent = '💡 參考答案（點擊選擇）：';
    container.appendChild(title);
    
    suggestions.forEach(suggestion => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = suggestion;
        btn.onclick = function() {
            const textarea = document.getElementById('answer-input');
            textarea.value = suggestion;
            sentences[currentStage] = suggestion;
            // 移除選中效果
            document.querySelectorAll('.suggestion-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        };
        container.appendChild(btn);
    });
    
    container.classList.remove('hidden');
}

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
    
    if (!studentGrade) {
        alert('請選擇你的年級！');
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
    
    // 根據關卡顯示參考答案
    const suggestionsContainer = document.getElementById('suggestions-container');
    if (index === 0) {
        // 第一關：不顯示參考答案
        suggestionsContainer.classList.add('hidden');
    } else if (index === 1) {
        // 第二關：根據第一關內容顯示情緒選項
        const suggestions = getFeelingSuggestions(sentences[0]);
        showSuggestions(suggestions);
    } else if (index === 2) {
        // 第三關：根據前兩關顯示學習發現選項
        const suggestions = getFindingsSuggestions(sentences[0], sentences[1]);
        showSuggestions(suggestions);
    } else if (index === 3) {
        // 第四關：顯示未來目標選項
        const suggestions = getFutureSuggestions(sentences[0], sentences[1], sentences[2]);
        showSuggestions(suggestions);
    }
    
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
// ========== 錯字訂正資料庫 ==========
const typoCorrections = {
    // 常見錯字
    '因爲': '因為',
    '己经': '已經',
    '觉得': '覺得',
    '学到': '學到',
    '有趣': '有趣',
    '开心': '開心',
    '发现': '發現',
    '学习': '學習',
    '老师': '老師',
    '同学': '同學',
    '感觉': '感覺',
    '想要': '想要',
    '可以': '可以',
    '真的': '真的',
    '非常': '非常',
    '以后': '以後',
    '所以': '所以',
    '而且': '而且',
    '虽然': '雖然',
    '但是': '但是',
    '因为': '因為',
    '如果': '如果',
    '这样': '這樣',
    '那样': '那樣',
    '什么': '什麼',
    '怎么': '怎麼',
    '为什么': '為什麼',
    '這裡': '這裡',
    '那里': '那裡',
    '哪里': '哪裡',
    '甚麼': '什麼',
    '怎麽': '怎麼',
    '麽': '麼',
    '著': '著',
    '了': '了',
    '過': '過',
    '會': '會',
    '對': '對',
    '從': '從',
    '給': '給',
    '讓': '讓',
    '與': '與',
    '及': '及',
    '或': '或',
    '而': '而',
    '但': '但',
    '若': '若',
    '如': '如',
    '因': '因',
    '所': '所',
    '以': '以',
    '於': '於',
    '這': '這',
    '那': '那',
    '哪': '哪',
    '個': '個',
    '們': '們',
    '嗎': '嗎',
    '呢': '呢',
    '吧': '吧',
    '啦': '啦',
    '囉': '囉',
    '喔': '喔',
    '噢': '噢',
    '嗯': '嗯',
    '啊': '啊',
    '啦': '啦',
    '哇': '哇',
    '耶': '耶',
    '喔': '喔',
    '嘻': '嘻',
    '哈哈': '哈哈',
    '嘿嘿': '嘿嘿',
    '呵呵': '呵呵',
    '嘻嘻': '嘻嘻',
    '呜呜': '嗚嗚',
    '哇哇': '哇哇',
    '哈哈哈': '哈哈哈',
    '嘿嘿嘿': '嘿嘿嘿',
    '呵呵呵': '呵呵呵',
    '嘻嘻嘻': '嘻嘻嘻',
    '呜呜呜': '嗚嗚嗚',
    '哇哇哇': '哇哇哇'
};

// ========== 文字潤飾函數 ==========
function polishText(text) {
    let polished = text;
    
    // 1. 修正錯字
    for (const [typo, correct] of Object.entries(typoCorrections)) {
        polished = polished.replace(new RegExp(typo, 'g'), correct);
    }
    
    // 2. 移除多餘的空白
    polished = polished.replace(/\s+/g, ' ').trim();
    
    // 3. 修正重複標點符號
    polished = polished.replace(/。，/g, '。');
    polished = polished.replace(/。、/g, '。');
    polished = polished.replace(/，。/g, '。');
    polished = polished.replace(/、。/g, '。');
    polished = polished.replace(/。。+/g, '。');
    polished = polished.replace(/，，+/g, '，');
    polished = polished.replace(/、、+/g, '、');
    
    // 4. 確保句首大寫（中文不需要，但處理英文）
    polished = polished.replace(/([。！？]\s*)([a-z])/g, (match, sep, letter) => sep + letter.toUpperCase());
    
    // 5. 移除句首的空白
    polished = polished.replace(/^[\s]+/, '');
    
    return polished;
}

// ========== 句子連接詞資料庫 ==========
const connectors = {
    feeling: ['因此', '所以', '這讓我觉得', '這使我感到', '對我來說'],
    finding: ['透過這次學習', '我發現', '我了解到', '原來', '這讓我想到'],
    future: ['接下來', '以後', '下次', '未來', '從今以後']
};

// ========== 串接短文 ==========
function compileEssay() {
    // 確保所有句子都已儲存
    sentences[currentStage] = document.getElementById('answer-input').value.trim();
    
    // 處理每個句子
    const processedSentences = [];
    
    sentences.forEach((sentence, index) => {
        if (sentence) {
            let processed = sentence;
            
            // 潤飾文字
            processed = polishText(processed);
            
            // 確保句子以標點符號結尾
            if (!processed.endsWith('。') && !processed.endsWith('！') && !processed.endsWith('？') && !processed.endsWith('！')) {
                processed += '。';
            }
            
            // 為第二句到第四句添加連接詞（如果句子沒有開頭連接詞）
            if (index > 0 && processedSentences.length > 0) {
                const hasConnector = connectors.feeling.some(c => processed.startsWith(c)) ||
                                   connectors.finding.some(c => processed.startsWith(c)) ||
                                   connectors.future.some(c => processed.startsWith(c));
                
                if (!hasConnector) {
                    // 不強制添加連接詞，保持學生原始表達
                }
            }
            
            processedSentences.push(processed);
        }
    });
    
    // 串接成短文
    let essay = processedSentences.join(' ');
    
    // 最終潤飾
    essay = polishText(essay);
    
    // 確保結尾有句號
    if (!essay.endsWith('。') && !essay.endsWith('！') && !essay.endsWith('？')) {
        essay += '。';
    }
    
    return essay;
}

// ========== 顯示成果 ==========
function showResult() {
    // 停止語音辨識
    stopVoice();
    
    const essay = compileEssay();
    
    // 切換到成果畫面
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    
    // 顯示學生姓名和年級
    document.getElementById('result-name').textContent = studentName;
    document.getElementById('result-grade').textContent = studentGrade + '年級';
    
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
            grade: studentGrade,
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
