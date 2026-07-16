// ========== 全域變數 ==========
let currentStage = 0;
let studentName = '';
let studentGrade = 0;
let sentences = [];
let recognition = null;
let isRecording = false;

// ========== 阿德勒心理學情緒資料庫 ==========
const adlerFeelingsDB = {
    // 學習成功類型
    achievement: {
        label: '成就感',
        grade3: ['今天學會了新東西，我覺得很開心。', '我做到了，好有成就感！', '完成任務讓我覺得很厲害！'],
        grade4: ['今天學會了新東西，我覺得很開心。', '我做到了，有成就感讓我好自豪。', '完成挑戰讓我覺得自己很棒！'],
        grade5: ['今天學會了新東西，我覺得很開心。', '我做到了，有成就感讓我覺得充實。', '完成挑戰讓我覺得自己很厲害！'],
        grade6: ['今天學會了新東西，我覺得很開心。', '我做到了，有成就感讓我覺得自信。', '完成挑戰讓我覺得自己成長了！']
    },
    // 發現新知類型
    discovery: {
        label: '驚奇感',
        grade3: ['我發現了新東西，覺得很好奇。', '這個知識好有趣，我想知道更多。', '原來是這樣，我覺得好神奇！'],
        grade4: ['我發現了新東西，覺得很好奇。', '這個知識好有趣，我想繼續探索。', '原來是這樣，我覺得驚奇！'],
        grade5: ['我發現了新東西，覺得很好奇。', '這個知識好有趣，我想深入了解。', '原來是這樣，我覺得驚奇！'],
        grade6: ['我發現了新東西，覺得很好奇。', '這個知識好有趣，我想繼續探索。', '原來是這樣，我覺得期待！']
    },
    // 克服困難類型
    challenge: {
        label: '努力感',
        grade3: ['這個有點難，但我想再試一次。', '遇到困難，但我不放棄。', '雖然難，但我要勇敢面對。'],
        grade4: ['這個有挑戰性，但我想再試一次。', '遇到困難，但我不放棄。', '雖然難，但我要繼續努力。'],
        grade5: ['這個有挑戰性，但我想克服困難。', '遇到困難，但我不放棄。', '雖然難，但我要堅強面對。'],
        grade6: ['這個有挑戰性，但我想持續努力。', '遇到困難，但我不放棄。', '雖然難，但我在成長中。']
    },
    // 合作學習類型
    cooperation: {
        label: '歸屬感',
        grade3: ['和同學一起學習，我覺得很開心。', '團隊合作讓學習更好玩。', '一起學讓我覺得不孤單。'],
        grade4: ['和同學一起學習，我覺得很開心。', '團隊合作讓學習更有效率。', '一起學讓我覺得有歸屬感。'],
        grade5: ['和同學一起學習，我覺得很開心。', '團隊合作讓我們一起成長。', '一起學讓我覺得有歸屬感。'],
        grade6: ['和同學一起學習，我覺得很開心。', '團隊合作讓我們互相學習。', '一起學讓我覺得一起成長。']
    },
    // 幫助他人類型
    helpful: {
        label: '貢獻感',
        grade3: ['幫助別人讓我覺得好快樂。', '分享知識讓我覺得好棒。', '我能幫忙，覺得很有意義。'],
        grade4: ['幫助別人讓我覺得好快樂。', '分享知識讓我覺得有貢獻。', '我能幫忙，覺得很有意義。'],
        grade5: ['幫助別人讓我覺得好快樂。', '分享知識讓我覺得有意義。', '我能幫忙，覺得充實。'],
        grade6: ['幫助別人讓我覺得好快樂。', '分享知識讓我覺得有貢獻。', '我能幫忙，覺得有意義。']
    },
    // 正向態度類型
    positive: {
        label: '正向態度',
        grade3: ['今天學的內容我很喜歡。', '這個課程很有趣，我開心。', '學習讓我覺得好玩。'],
        grade4: ['今天學的內容我很喜歡。', '這個課程很有趣，我開心。', '學習讓我覺得感動。'],
        grade5: ['今天學的內容我很喜歡。', '這個課程很有趣，我驚奇。', '學習讓我覺得滿足。'],
        grade6: ['今天學的內容我很喜歡。', '這個課程很有趣，我充實。', '學習讓我覺得有成就感。']
    },
    // 一般情緒
    general: {
        label: '一般感受',
        grade3: ['今天的課我還好，但有學到東西。', '我专心聽課，覺得平靜。', '學習讓我覺得還不錯。'],
        grade4: ['今天的課我還好，但有學到東西。', '我專注聽課，覺得平静。', '學習讓我覺得好奇。'],
        grade5: ['今天的課我還好，但有學到東西。', '我專注聽課，覺得平静。', '學習讓我覺得好奇。'],
        grade6: ['今天的課我還好，但有學到東西。', '我專注聽課，覺得期待。', '學習讓我覺得好奇。']
    }
};

// ========== 事實內容分析 ==========
function analyzeFactContent(factText) {
    const text = factText.toLowerCase();
    const result = {
        type: 'general',
        keywords: [],
        subjects: []
    };
    
    // 分析學科類別
    if (text.includes('科學') || text.includes('實驗') || text.includes('自然') || text.includes('生物') || text.includes('物理') || text.includes('化學')) {
        result.subjects.push('science');
    }
    if (text.includes('國語') || text.includes('讀') || text.includes('寫') || text.includes('作文') || text.includes('閱讀')) {
        result.subjects.push('language');
    }
    if (text.includes('數學') || text.includes('計算') || text.includes('數字') || text.includes('幾何')) {
        result.subjects.push('math');
    }
    if (text.includes('社會') || text.includes('歷史') || text.includes('地理') || text.includes('公民')) {
        result.subjects.push('social');
    }
    if (text.includes('藝') || text.includes('音樂') || text.includes('美術') || text.includes('體育')) {
        result.subjects.push('art');
    }
    
    // 分析學習情境類型
    if (text.includes('成功') || text.includes('學會') || text.includes('完成') || text.includes('做到') || text.includes('得到') || text.includes('贏得')) {
        result.type = 'achievement';
        result.keywords.push('成就');
    } else if (text.includes('發現') || text.includes('原來') || text.includes('知道') || text.includes('了解') || text.includes('新')) {
        result.type = 'discovery';
        result.keywords.push('發現');
    } else if (text.includes('難') || text.includes('挑戰') || text.includes('困難') || text.includes('不會') || text.includes('失敗')) {
        result.type = 'challenge';
        result.keywords.push('挑戰');
    } else if (text.includes('一起') || text.includes('同學') || text.includes('分組') || text.includes('合作') || text.includes('團隊')) {
        result.type = 'cooperation';
        result.keywords.push('合作');
    } else if (text.includes('幫') || text.includes('分享') || text.includes('教') || text.includes('服務')) {
        result.type = 'helpful';
        result.keywords.push('幫助');
    } else if (text.includes('有趣') || text.includes('好玩') || text.includes('喜歡') || text.includes('開心')) {
        result.type = 'positive';
        result.keywords.push('正向');
    }
    
    return result;
}

// ========== 依據阿德勒心理學的情緒建議 ==========
function getAdlerFeelingSuggestions(factText) {
    const analysis = analyzeFactContent(factText);
    const suggestions = [];
    
    // 取得對應年級的選項
    const gradeKey = `grade${studentGrade}`;
    const feelings = adlerFeelingsDB[analysis.type]?.[gradeKey] || adlerFeelingsDB.general[gradeKey];
    
    // 提供 2-3 個選項
    suggestions.push(...feelings.slice(0, 3));
    
    return suggestions;
}

// ========== 學習發現資料庫（依年級區分） ==========
const findingsDB = {
    // 3年級用詞
    grade3: {
        general: ['我發現原來是這樣！', '這個知識很有趣。', '我學會了新東西。'],
        science: ['我發現大自然好神奇。', '實驗讓我覺得好好玩。'],
        language: ['我發現故事好有趣。', '我可以學到新字。'],
        math: ['我發現數字好好玩。', '數學可以用來數東西。'],
        social: ['我發現歷史故事好有趣。']
    },
    // 4年級用詞
    grade4: {
        general: ['我發現這跟我以前想的不一樣。', '這個知識可以用在生活中。', '我學會了一個新方法。'],
        science: ['我發現科學真有趣，可以做實驗。', '大自然有很多奧秘。'],
        language: ['我發現閱讀可以學到很多東西。', '寫作可以用不同的方式表達。'],
        math: ['我發現數學可以用來解決問題。', '思考問題有很多方法。'],
        social: ['我發現歷史故事很有趣。', '我們的生活跟環境有關係。']
    },
    // 5年級用詞
    grade5: {
        general: ['我發現這跟我以前想的不一樣。', '這個知識可以用在生活中。', '我學會了一個新方法。', '這跟其他科目有關係。'],
        science: ['我發現科學真有趣，可以做實驗。', '大自然有很多奧秘。', '觀察和實驗很重要。'],
        language: ['我發現閱讀可以學到很多東西。', '寫作可以用不同的方式表達。', '語言很有魅力。'],
        math: ['我發現數學可以用來解決問題。', '數學就在我們身邊。', '思考問題有很多方法。'],
        social: ['我發現歷史故事很有趣。', '我們的生活跟環境有關係。', '要關心我們的社會。']
    },
    // 6年級用詞
    grade6: {
        general: ['我發現這跟我以前想的不一樣。', '這個知識可以用在生活中，也能幫助別人。', '我學會了一個新方法，可以應用在其他地方。', '這跟其他科目有關係，可以跨领域思考。'],
        science: ['我發現科學真有趣，可以做實驗驗證想法。', '大自然有很多奧秘等待探索。', '觀察和實驗是科學的重要方法。'],
        language: ['我發現閱讀可以學到很多東西，也能增進表達能力。', '寫作可以用不同的方式表達想法。', '語言是溝通的橋樑。'],
        math: ['我發現數學可以用來解決生活中的問題。', '數學就在我們身邊。', '思考問題有很多方法，要選擇最適合的。'],
        social: ['我發現歷史故事很有趣，可以從中學習。', '我們的生活跟環境有關係。', '要關心我們的社會，做個負責任的公民。']
    }
};

// ========== 未來目標資料庫（依年級區分） ==========
const futureDB = {
    // 3年級用詞
    grade3: {
        general: ['下次我要更認真聽課。', '我想再學更多相關的東西。', '我要跟同學分享今天學到的。'],
        try_new: ['下次我想試試看這個方法。', '我想自己動手做做看。'],
        explore: ['我想看更多相關的書。', '下次我想問老師更多問題。']
    },
    // 4年級用詞
    grade4: {
        general: ['下次我要更專心聽講。', '我想繼續學習這個主題。', '我要跟同學分享今天學到的。'],
        try_new: ['下次我想問更多問題。', '我想繼續學習這個主題。', '我要跟同學分享今天學到的。'],
        explore: ['我想探索更多相關的知識。', '下次我想查更多資料。', '我要找更多相關的書來看。']
    },
    // 5年級用詞
    grade5: {
        general: ['下次我要更專心聽講，深入學習。', '我想繼續探索這個主題。', '我要跟同學分享，一起討論。'],
        try_new: ['我想試試看今天學到的方法。', '下次我想自己動手做做看。', '我要把今天學到的用在生活中。'],
        explore: ['我想探索更多相關的知識。', '下次我想查更多資料。', '我要找更多相關的書來看。']
    },
    // 6年級用詞
    grade6: {
        general: ['下次我要更專心聽講，深入學習並應用。', '我想繼續探索這個主題，了解更多細節。', '我要跟同學分享，一起討論並互相學習。'],
        try_new: ['我想試試看今天學到的方法，並記錄結果。', '下次我想自己動手做做看，驗證想法。', '我要把今天學到的用在生活中，幫助別人。'],
        explore: ['我想探索更多相關的知識，建立完整概念。', '下次我想查更多資料，做深入研究。', '我要找更多相關的書來看，擴展視野。']
    }
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

// ========== 取得年級對應的資料庫 ==========
function getGradeDB(grade) {
    switch (grade) {
        case 3: return { feelings: feelingsDB.grade3, findings: findingsDB.grade3, future: futureDB.grade3 };
        case 4: return { feelings: feelingsDB.grade4, findings: findingsDB.grade4, future: futureDB.grade4 };
        case 5: return { feelings: feelingsDB.grade5, findings: findingsDB.grade5, future: futureDB.grade5 };
        case 6: return { feelings: feelingsDB.grade6, findings: findingsDB.grade6, future: futureDB.grade6 };
        default: return { feelings: feelingsDB.grade4, findings: findingsDB.grade4, future: futureDB.grade4 };
    }
}

// ========== 參考答案生成 ==========
function getFeelingSuggestions(factText) {
    // 使用阿德勒心理學的情緒建議系統
    return getAdlerFeelingSuggestions(factText);
}

function getFindingsSuggestions(factText, feelingText) {
    const suggestions = [];
    const fact = factText.toLowerCase();
    const gradeDB = getGradeDB(studentGrade);
    
    // 根據事實內容推測學習發現
    if (fact.includes('科學') || fact.includes('實驗') || fact.includes('自然')) {
        suggestions.push(...gradeDB.findings.science.slice(0, 2));
    } else if (fact.includes('國語') || fact.includes('讀') || fact.includes('寫')) {
        suggestions.push(...gradeDB.findings.language.slice(0, 2));
    } else if (fact.includes('數學') || fact.includes('計算') || fact.includes('數字')) {
        suggestions.push(...gradeDB.findings.math.slice(0, 2));
    } else if (fact.includes('社會') || fact.includes('歷史') || fact.includes('生活')) {
        suggestions.push(...gradeDB.findings.social.slice(0, 2));
    } else {
        suggestions.push(...gradeDB.findings.general.slice(0, 2));
    }
    
    return suggestions;
}

function getFutureSuggestions(factText, feelingText, findingText) {
    const suggestions = [];
    const gradeDB = getGradeDB(studentGrade);
    
    // 根據前面的內容推測未來目標
    if (findingText.includes('想') || findingText.includes('試')) {
        suggestions.push(...gradeDB.future.try_new.slice(0, 2));
    } else {
        suggestions.push(...gradeDB.future.general.slice(0, 2));
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
    } else {
        // 其他關卡：不顯示參考答案
        suggestionsContainer.classList.add('hidden');
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
    
    // 1. 移除表情符號（保留標點符號和中文）
    polished = polished.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
    polished = polished.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
    polished = polished.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
    polished = polished.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '');
    polished = polished.replace(/[\u{1F900}-\u{1F9FF}]/gu, '');
    polished = polished.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '');
    polished = polished.replace(/[\u{1FA70}-\u{1FAFF}]/gu, '');
    
    // 2. 修正錯字
    for (const [typo, correct] of Object.entries(typoCorrections)) {
        polished = polished.replace(new RegExp(typo, 'g'), correct);
    }
    
    // 3. 移除贅字和贅詞（安全版本，避免亂碼）
    // 簡化版：只處理明確的贅字
    polished = polished.replace(/其實我覺得/g, '我覺得');
    polished = polished.replace(/然後我覺得/g, '我覺得');
    polished = polished.replace(/就是說/g, '就是');
    polished = polished.replace(/然後呢/g, '然後');
    polished = polished.replace(/所以說/g, '所以');
    polished = polished.replace(/順便一提/g, '');
    polished = polished.replace(/順便說一下/g, '');
    polished = polished.replace(/總之來說/g, '總之');
    polished = polished.replace(/整體來說/g, '整體');
    polished = polished.replace(/簡單來說/g, '簡單');
    polished = polished.replace(/基本上來說/g, '基本上');
    polished = polished.replace(/嚴格來說/g, '嚴格');
    polished = polished.replace(/廣泛來說/g, '廣泛');
    polished = polished.replace(/一般來說/g, '一般');
    polished = polished.replace(/特別來說/g, '特別');
    
    // 4. 移除重複字（安全版本）
    // 移除連續重複的語助詞
    polished = polished.replace(/嗯嗯/g, '');
    polished = polished.replace(/對對對/g, '對');
    polished = polished.replace(/是是是/g, '是');
    polished = polished.replace(/好好好/g, '好');
    polished = polished.replace(/那個那個/g, '那個');
    polished = polished.replace(/這個這個/g, '這個');
    polished = polished.replace(/就是就是/g, '就是');
    polished = polished.replace(/然後然後/g, '然後');
    polished = polished.replace(/所以所以/g, '所以');
    polished = polished.replace(/因為因為/g, '因為');
    polished = polished.replace(/但是但是/g, '但是');
    polished = polished.replace(/可是可是/g, '可是');
    polished = polished.replace(/不過不過/g, '不過');
    polished = polished.replace(/而且而且/g, '而且');
    polished = polished.replace(/或者或者/g, '或者');
    polished = polished.replace(/還有還有/g, '還有');
    polished = polished.replace(/另外另外/g, '另外');
    polished = polished.replace(/並且並且/g, '並且');
    polished = polished.replace(/至於至於/g, '至於');
    
    // 5. 移除多餘的空白
    polished = polished.replace(/\s+/g, ' ').trim();
    
    // 6. 修正重複標點符號
    polished = polished.replace(/。，/g, '。');
    polished = polished.replace(/。、/g, '。');
    polished = polished.replace(/，。/g, '。');
    polished = polished.replace(/、。/g, '。');
    polished = polished.replace(/。。+/g, '。');
    polished = polished.replace(/，，+/g, '，');
    polished = polished.replace(/、、+/g, '、');
    
    // 7. 移除句首的空白
    polished = polished.replace(/^[\s]+/, '');
    
    return polished;
}

// ========== 句子流暢度優化 ==========
function optimizeSentenceFlow(sentences) {
    if (sentences.length === 0) return '';
    
    // 簡單的句子優化，不添加額外連接詞
    return sentences;
}

// ========== 句子連接詞資料庫 ==========
const connectors = {
    feeling: [],
    finding: [],
    future: []
};

// ========== 串接短文 ==========
function compileEssay() {
    // 確保所有句子都已儲存
    sentences[currentStage] = document.getElementById('answer-input').value.trim();
    
    // 依序處理每一個句子
    const cleaned = [];
    
    sentences.forEach((sentence) => {
        if (sentence) {
            let s = polishText(sentence);
            
            // 確保句子以標點符號結尾
            if (!/[。！？]$/.test(s)) {
                s += '。';
            }
            
            // 去除句首句尾空白
            s = s.trim();
            
            cleaned.push(s);
        }
    });
    
    if (cleaned.length === 0) return '';
    
    // ---- 組合成自然的短文 ----
    // 策略：前後句之間去掉多餘空白，直接併成一段
    // 若句子之間缺乏連接，自動補上自然的過渡詞
    let essay = '';
    
    cleaned.forEach((s, i) => {
        if (i === 0) {
            // 第一句直接寫入
            essay = s;
        } else {
            // 檢查前一句結尾與本句開頭，決定是否需要過渡
            const prev = essay.charAt(essay.length - 1);
            const first = s.charAt(0);
            
            // 前句以句號、驚嘆號或問號結尾時，直接併入
            if (prev === '。' || prev === '！' || prev === '？') {
                essay += s;
            } else {
                essay += '，' + s;
            }
        }
    });
    
    // 最終潤飾
    essay = polishText(essay);
    
    // 確保結尾有標點
    if (!/[。！？]$/.test(essay)) {
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
