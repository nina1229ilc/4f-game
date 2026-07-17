from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime

app = Flask(__name__)

# Google 表單連結
GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe9_aorqQ-mxf4jqGyIVx9Ys_8rtn31p_t-CO49T7_n8jziQw/viewform"

# 4F 關卡設定
STAGES = [
    {
        "id": 1,
        "name": "Facts",
        "emoji": "📋",
        "title": "第1關：事實",
        "question": "今天這節課，你學到了什麼？",
        "hint": "想想看，老師今天教了什麼內容？你記住了哪些重點？",
        "placeholder": "例如：今天這節課，我學到了...",
        "color": "#FF6B6B"
    },
    {
        "id": 2,
        "name": "Feelings",
        "emoji": "💭",
        "title": "第2關：感受",
        "question": "你覺得怎麼樣？有什麼感受？",
        "hint": "開心、驚奇、感動、挑戰、有趣...說說你的心情！",
        "placeholder": "例如：我覺得很有趣，因為...",
        "color": "#4ECDC4"
    },
    {
        "id": 3,
        "name": "Findings",
        "emoji": "🔍",
        "title": "第3關：發現",
        "question": "你發現了什麼？有什麼新想法？",
        "hint": "這個讓你聯想到什麼？跟你之前知道的有什麼關係？",
        "placeholder": "例如：我發現原來...",
        "color": "#FFE66D"
    },
    {
        "id": 4,
        "name": "Future",
        "emoji": "🚀",
        "title": "第4關：未來",
        "question": "下次你會怎麼做？有什麼新目標？",
        "hint": "你想試試看什麼？想繼續學習什麼？",
        "placeholder": "例如：下次我會...",
        "color": "#95E1D3"
    }
]

@app.route('/')
def index():
    return render_template('index.html', stages=STAGES, google_form_url=GOOGLE_FORM_URL)

@app.route('/api/stages')
def get_stages():
    return jsonify(STAGES)

if __name__ == '__main__':
    from waitress import serve
    port = int(os.environ.get('PORT', 5000))
    print(f"啟動 Waitress 伺服器，監聽連接埠 {port}...")
    serve(app, host='0.0.0.0', port=port)
