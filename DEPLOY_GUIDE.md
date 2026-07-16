# 4F 心得闖關遊戲 - 雲端部署指南

## 部署流程

### 第一步：建立 GitHub 倉庫

1. 前往 https://github.com/new
2. 倉庫名稱填入：`4f-game`
3. 選擇 **Public**
4. 按下 **Create repository**
5. 記下倉庫網址（例如：`https://github.com/你的帳號/4f-game`）

### 第二步：推送到 GitHub

在電腦上打開 PowerShell，執行以下指令：

```powershell
# 進入專案目錄
cd D:\OpenCode_0716\4f_game

# 初始化 git
git init
git add .
git commit -m "Initial commit: 4F game"

# 連結遠端倉庫（替換成你的倉庫網址）
git remote add origin https://github.com/你的帳號/4f-game.git
git branch -M main
git push -u origin main
```

### 第三步：部署到 Render

1. 前往 https://render.com 註冊帳號（可用 GitHub 登入）
2. 點選 **New +** → **Web Service**
3. 連結你的 GitHub 倉庫（選擇 `4f-game`）
4. 設定如下：
   - **Name**: `4f-game`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Plan**: `Free`
5. 點選 **Create Web Service**

### 第四步：取得公開連結

部署完成後，Render 會給你一個網址，例如：
```
https://4f-game.onrender.com
```

把这个網址貼給學生，他們就可以在手機或電腦上使用了！

---

## 注意事項

### 免費方案限制
- Render 免費方案在 15 分鐘沒有請求時會自動休眠
- 第一次載入可能需要 30-50 秒
- 學生使用時會自動喚醒

### 語音輸入
- 手機：支援 iOS Safari 和 Android Chrome
- 電腦：建議使用 Chrome 瀏覽器
- 需要允許麥克風權限

### 學生作品
- 雲端版本不會儲存學生作品到伺服器
- 學生完成後會自動下載 TXT 檔案
- 可以請學生把下載的檔案交給老師

---

## 常見問題

### Q: 部署失敗怎麼辦？
A: 檢查 Render 的 Build Logs，通常是 requirements.txt 有問題。

### Q: 語音輸入不能用？
A: 確認使用 Chrome 瀏覽器，並允許麥克風權限。

### Q: 如何查看學生作品？
A: 請學生下載檔案後，用電子郵件或學習平台繳交。
