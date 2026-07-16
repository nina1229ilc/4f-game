from flask import Flask, render_template, request, jsonify, send_file
import os
import csv
import io
from datetime import datetime

app = Flask(__name__)

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

# 存儲學生作品（記憶體存儲）
essays_store = []

@app.route('/')
def index():
    return render_template('index.html', stages=STAGES)

@app.route('/teacher')
def teacher_dashboard():
    return render_template('teacher.html', essays=essays_store, stages=STAGES)

@app.route('/api/stages')
def get_stages():
    return jsonify(STAGES)

@app.route('/api/save', methods=['POST'])
def save_essay():
    """儲存學生作品到記憶體"""
    data = request.json
    student_name = data.get('name', '未命名學生')
    student_grade = data.get('grade', '未指定')
    sentences = data.get('sentences', [])
    essay = data.get('essay', '')
    
    # 建立作品記錄
    essay_record = {
        'id': len(essays_store) + 1,
        'name': student_name,
        'grade': student_grade,
        'sentences': sentences,
        'essay': essay,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    essays_store.append(essay_record)
    
    # 產生下載用的檔案內容
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # 純文字版
    txt_content = f"學生姓名：{student_name}\n"
    txt_content += f"年級：{student_grade}年級\n"
    txt_content += f"時間：{timestamp}\n"
    txt_content += "=" * 40 + "\n\n"
    for i, s in enumerate(sentences):
        if i < len(STAGES):
            txt_content += f"{STAGES[i]['emoji']} {STAGES[i]['title']}：\n"
            txt_content += f"{s}\n\n"
    txt_content += "=" * 40 + "\n"
    txt_content += "【串接短文】\n\n"
    txt_content += essay
    
    return jsonify({
        'success': True,
        'message': '作品已儲存！',
        'filename': f"{student_name}_{timestamp}.txt",
        'content': txt_content
    })

@app.route('/api/essays')
def get_essays():
    """取得所有作品"""
    return jsonify(essays_store)

@app.route('/api/export/csv')
def export_csv():
    """匯出 CSV 檔案（可匯入 Google 試算表）"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # 寫入標題列
    header = ['序號', '學生姓名', '年級', '時間',
              '第1關：事實', '第2關：感受', '第3關：發現', '第4關：未來',
              '串接短文']
    writer.writerow(header)
    
    # 寫入資料列
    for essay in essays_store:
        row = [
            essay['id'],
            essay['name'],
            essay['grade'],
            essay['timestamp']
        ]
        # 加入四個關卡的內容
        for i in range(4):
            if i < len(essay['sentences']):
                row.append(essay['sentences'][i])
            else:
                row.append('')
        # 加入串接短文
        row.append(essay['essay'])
        writer.writerow(row)
    
    # 準備下載
    output.seek(0)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8-sig')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'4F學習心得_{timestamp}.csv'
    )

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
