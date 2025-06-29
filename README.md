# Carvel Far Rockaway 個人網站

這是一個結合了 AI 聊天功能的個人網站，使用 Google Gemini API 提供智能對話服務。

## 功能特色

- ✨ 現代化響應式設計
- 🤖 Gemini AI 聊天助理
- 🎤 語音轉文字功能
- 👤 簡化的用戶認證系統
- 📱 完全響應式設計

## 已修復問題

1. **移除 Firebase 依賴** - 專案現在只依賴 Gemini API
2. **修復 Gemini API 整合** - 使用最新的官方 `@google/genai` API
3. **實現語音識別** - 使用 Web Speech API 進行語音轉文字
4. **簡化認證系統** - 使用 localStorage 進行基本認證
5. **中文本地化** - 將介面翻譯為繁體中文
6. **修復瀏覽器兼容性** - 解決 ES6 模組載入問題
7. **升級至最新 API** - 使用 `gemini-2.5-flash` 模型和新的 API 結構

## 快速開始

### 1. 設置環境變數（推薦）

創建或編輯 `.env` 文件並添加您的 Gemini API 金鑰：

\`\`\`bash

# .env 文件

GEMINI_API_KEY=your_actual_gemini_api_key_here
\`\`\`

### 2. 瀏覽器端配置（僅限開發測試）

如果直接在瀏覽器中使用，可以編輯 `js/config.js` 文件：

\`\`\`javascript
// 取消註解並設置您的 API 金鑰
window.process.env.GEMINI_API_KEY = 'your_actual_gemini_api_key_here';
\`\`\`

**⚠️ 安全提醒：**

- 不要在生產環境中在客戶端暴露 API 金鑰
- 建議通過後端代理 API 請求

### 3. 啟動伺服器（可選）

如果您想使用 Node.js 伺服器：

\`\`\`bash

# 如果遇到 npm 權限問題，可以嘗試：

npm cache clean --force

# 或直接使用 yarn：

yarn install
yarn start

# 或者直接運行：

node server.js
\`\`\`

### 4. 直接使用

您也可以直接在瀏覽器中打開 `index.html` 文件來使用網站。

## 獲取 Gemini API 金鑰

1. 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登入您的 Google 帳戶
3. 創建新的 API 金鑰
4. 將金鑰複製到配置文件中

## 使用說明

### AI 聊天功能

- 在聊天框中輸入訊息並按下發送按鈕
- 點擊麥克風按鈕進行語音輸入（需要瀏覽器支援）
- AI 將使用 Gemini 模型回應您的問題

### 用戶認證

- 簡化的登入/註冊系統
- 資料暫存在瀏覽器的 localStorage 中
- 支援基本的表單驗證

### 語音功能

- 使用瀏覽器內建的 Web Speech API
- 支援繁體中文語音識別
- 需要 HTTPS 或 localhost 環境

## 瀏覽器支援

- Chrome/Edge（推薦）- 完整支援所有功能
- Firefox - 支援大部分功能（語音功能有限）
- Safari - 基本功能支援

## 技術棧

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **AI**: Google Gemini API (`@google/genai` v0.2.0+)
- **語音**: Web Speech API
- **後端**: Node.js + Express（可選）
- **樣式**: 自訂 CSS + Font Awesome
- **模型**: Gemini 2.5 Flash（最新版本）

## 故障排除

### API 金鑰錯誤

- 確認 API 金鑰是否正確設置
- 檢查 API 金鑰是否有效且有足夠配額

### 語音功能無法使用

- 確保瀏覽器支援 Web Speech API
- 檢查麥克風權限是否已授予
- 嘗試在 HTTPS 環境下使用

### npm 安裝問題

- 嘗試清理 npm 快取：`npm cache clean --force`
- 或使用 yarn 替代：`yarn install`
- 或直接在瀏覽器中打開 `index.html`

## 授權

本專案僅供學習和個人使用。請確保遵守 Google Gemini API 的使用條款。
