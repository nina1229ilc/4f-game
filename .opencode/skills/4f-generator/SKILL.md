---
name: 4f-generator
description: Use when building a 4F learning reflection web app (Facts→Feelings→Findings→Future) with Flask, cartoon-style frontend, voice input, grade-specific suggestions, and essay compilation. Trigger keywords: 4F, 學習心得, 反思, 心得短文, 闖關遊戲, 點子發電機.
---

# 4F 點子發電機 — 開發技能指南

本技能記錄從零建立「4F 點子發電機」學習心得反思 web app 的完整流程與關鍵設計決策。

## 什麼是 4F？

4F 是一種反思框架，引導學生依序完成四個步驟：

| 步驟 | 英文 | 中文 | 問題 |
|------|------|------|------|
| 1 | Facts | 事實 | 今天學到了什麼？ |
| 2 | Feelings | 感受 | 你覺得怎麼樣？ |
| 3 | Findings | 發現 | 你發現了什麼？ |
| 4 | Future | 未來 | 下次你會怎麼做？ |

## 技術架構

```
4f_game/
├── app.py                    # Flask 後端
├── requirements.txt          # flask
├── render.yaml               # Render 部署設定
├── templates/
│   ├── index.html            # 學生端頁面
│   └── teacher.html          # 教師管理面板
└── static/
    ├── css/style.css         # 卡通風格 CSS
    └── js/script.js          # 遊戲邏輯、語音辨識、順稿
```

## 開發流程（Step-by-Step）

### Step 1：建立 Flask 後端

```python
# app.py 核心結構
from flask import Flask, render_template, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html',
        google_form_url='YOUR_GOOGLE_FORM_URL')

@app.route('/teacher')
def teacher():
    return render_template('teacher.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### Step 2：建立卡通風格前端

設計要點：
- 使用 `border-radius` 和 `box-shadow` 創造圓角卡片
- 漸層背景色（每關不同顏色）
- 大尺寸 emoji 作為關卡圖示
- 手機優先響應式設計
- 語音辨識按鈕（Web Speech API）

### Step 3：遊戲邏輯（script.js）

核心全域變數：
```javascript
let currentStage = 0;    // 目前關卡 (0-3)
let studentName = '';
let studentGrade = 0;
let sentences = [];      // 四關的答案
```

關卡資料結構：
```javascript
const stages = [
    { id: 1, name: 'Facts',    emoji: '📋', title: '第1關：事實', color: '#FF6B6B' },
    { id: 2, name: 'Feelings', emoji: '💭', title: '第2關：感受', color: '#4ECDC4' },
    { id: 3, name: 'Findings', emoji: '🔍', title: '第3關：發現', color: '#FFE66D' },
    { id: 4, name: 'Future',   emoji: '🚀', title: '第4關：未來', color: '#95E1D3' }
];
```

### Step 4：阿德勒心理學情緒建議系統（第2關）

根據第一關的事實內容，自動分析學習情境類型，提供對應情緒詞語：

```javascript
// 情境分析邏輯
function analyzeFactContent(factText) {
    const text = factText.toLowerCase();
    // 成就類：成功、學會、完成、做到
    // 驚奇類：發現、原來、知道、新
    // 努力類：難、挑戰、困難、不會
    // 歸屬類：一起、同學、合作、團隊
    // 貢獻類：幫、分享、教、服務
}
```

情緒詞語資料庫結構：
```javascript
const adlerFeelingsDB = {
    achievement: { label: '成就感', grade3: [...], grade4: [...], ... },
    discovery:   { label: '驚奇感', grade3: [...], grade4: [...], ... },
    challenge:   { label: '努力感', grade3: [...], grade4: [...], ... },
    cooperation: { label: '歸屬感', grade3: [...], grade4: [...], ... },
    helpful:     { label: '貢獻感', grade3: [...], grade4: [...], ... },
    positive:    { label: '正向態度', grade3: [...], grade4: [...], ... },
    general:     { label: '一般感受', grade3: [...], grade4: [...], ... }
};
```

**重要設計決策：**
- 第2關只提供簡短詞語（如「開心」），不提供完整句子
- 第3、4關不提供參考答案，讓學生自由表達
- 詞語依年級調整複雜度（3年級簡單、6年級成熟）

### Step 5：年級分級系統

```javascript
function getGradeDB(grade) {
    switch(grade) {
        case 3: return { feelings: feelingsDB.grade3, findings: findingsDB.grade3, future: futureDB.grade3 };
        case 4: return { feelings: feelingsDB.grade4, findings: findingsDB.grade4, future: futureDB.grade4 };
        case 5: return { feelings: feelingsDB.grade5, findings: findingsDB.grade5, future: futureDB.grade5 };
        case 6: return { feelings: feelingsDB.grade6, findings: findingsDB.grade6, future: futureDB.grade6 };
    }
}
```

### Step 6：文字潤飾系統（polishText）

```javascript
function polishText(text) {
    let polished = text;

    // 1. 移除表情符號（注意：不能使用會涵蓋 CJK 的範圍！）
    // 安全範圍：U+1F600-U+1F64F, U+1F300-U+1F5FF 等
    // 危險範圍：[\u{24C2}-\u{1F251}] 會吃掉所有中文！

    // 2. 修正錯字（typoCorrections 物件）

    // 3. 移除贅字贅詞
    //    「其實我覺得」→「我覺得」
    //    「然後呢」→「然後」
    //    「順便一提」→「」

    // 4. 移除重複語助詞
    //    「嗯嗯」→「」
    //    「對對對」→「對」

    // 5. 修正重複標點
    //    「。。」→「。」

    return polished;
}
```

**⚠️ 重要教訓：**
表情符號移除範圍 `[\u{24C2}-\u{1F251}]` 涵蓋了 U+4E00–U+9FFF（整個 CJK 區塊），會導致所有中文文字被刪除。必須使用精確的 emoji 範圍。

### Step 7：自動補主詞（addSubject）

```javascript
function addSubject(text, stageId) {
    const s = text.trim();
    if (/^[我她他它們]/.test(s)) return s;  // 已有主詞

    switch (stageId) {
        case 0: return '我' + s;                    // 事實
        case 1:                                     // 感受
            if (/開心|快樂|有趣/.test(s))
                return '心裡感到' + s;
            return '我覺得' + s;
        case 2: return '我發現' + s;                // 發現
        case 3:                                     // 未來
            if (/想|要|會|希望/.test(s))
                return '我' + s;
            return '我要' + s;
    }
}
```

### Step 8：短文彙整（compileEssay）

```javascript
function compileEssay() {
    const cleaned = [];
    sentences.forEach((sentence, index) => {
        if (sentence) {
            let s = polishText(sentence);
            s = addSubject(s, index);          // 補主詞
            if (!/[。！？]$/.test(s)) s += '。'; // 確保結尾標點
            cleaned.push(s.trim());
        }
    });

    // 組合成自然短文
    let essay = '';
    cleaned.forEach((s, i) => {
        if (i === 0) {
            essay = s;
        } else {
            const prev = essay.charAt(essay.length - 1);
            if ('。！？'.includes(prev)) {
                essay += s;           // 前句已結尾，直接併入
            } else {
                essay += '，' + s;    // 加逗號銜接
            }
        }
    });

    return polishText(essay);
}
```

### Step 9：語音辨識（Web Speech API）

```javascript
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = function(event) {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (finalTranscript) {
            textarea.value += finalTranscript;
        }
    };
}
```

### Step 10：部署

**GitHub：**
```bash
git init
git add .
git commit -m "Initial commit: 4F game"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

**Render（免費方案）：**
1. 連結 GitHub repo
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `python app.py`
4. Manual Deploy → Deploy latest commit

## 關鍵設計原則

1. **手機優先**：學生用手機操作，按鈕要大、間距要夠
2. **卡通風格**：圓角、漸層、emoji，吸引小學生
3. **語音輸入**：低年級學生可能打字慢，語音是重要輔助
4. **阿德勒心理學**：情緒建議基於社會興趣、追求優越感、補償作用
5. **自動潤飾**：移除贅字、修正錯字、補主詞，但不能吃掉中文
6. **簡短詞語**：第2關只給詞語參考，不給完整句子
7. **自由表達**：第3、4關不給參考，鼓勵原創思考
8. **無需儲存**：最終短文由學生自行複製貼到 Google Form

## 常見陷阱

| 問題 | 原因 | 解法 |
|------|------|------|
| 短文空白 | emoji 移除範圍涵蓋 CJK | 使用精確 Unicode 範圍 |
| 句子不通順 | 直接用空白連接 | 用標點判斷是否需加逗號 |
| 缺少主詞 | 學生只打詞語 | addSubject 依關卡自動補 |
| 按鈕文字錯誤 | 硬編碼未同步更新 | 統一用變數管理 |
| Render 部署失敗 | 找不到 Manual Deploy | Dashboard → 服務 → Manual Deploy 按鈕 |
