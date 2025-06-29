# Carvel Far Rockaway - AI 智能數據分析平台

這是一個結合 Google Gemini AI 的智能數據分析平台，支援 Excel/CSV 文件分析、語音識別和自然語言對話。

## 🌟 主要功能

### 1. AI 聊天功能

- 使用 Google Gemini 2.5 Flash 模型
- 支援自然語言對話
- 智能上下文理解
- 繁體中文介面

### 2. 數據分析功能

- 支援 Excel (.xlsx/.xls) 和 CSV 文件
- 自動數據類型識別
- 智能數據統計和分析
- 視覺化數據預覽
- AI 驅動的數據洞察

### 3. 語音功能

- 語音轉文字
- 即時語音識別
- 多語言支援

### 4. 用戶介面

- 響應式設計
- 現代化 UI/UX
- 暗色/亮色主題
- 直觀的文件上傳介面

## 🚀 快速開始

### 環境要求

- Node.js 18.0 或以上
- npm 9.0 或以上
- 現代瀏覽器（Chrome、Firefox、Safari、Edge 等）

### 安裝步驟

1. 克隆專案

```bash
git clone https://github.com/your-username/Carvel-Far-Rockaway.git
cd Carvel-Far-Rockaway
```

2. 安裝依賴

```bash
npm install
```

3. 設置環境變數

```bash
cp env.example .env
```

編輯 .env 文件，設置您的 Gemini API 金鑰：

```
GEMINI_API_KEY=your_api_key_here
```

4. 啟動服務器

```bash
npm start
```

5. 訪問應用
   打開瀏覽器訪問：http://localhost:3000

## 📊 數據分析功能使用指南

### Excel/CSV 文件分析

1. 點擊「上傳 Excel/CSV」按鈕
2. 選擇要分析的文件
3. 等待系統處理和分析
4. 查看自動生成的分析報告

### 分析報告包含：

- 文件概況（行數、欄位數等）
- 數據統計（類型、範圍、分布等）
- 數據預覽
- AI 深度分析
- 數據品質評估
- 應用建議

## 🎯 API 使用說明

### Gemini API 配置

```javascript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
```

### 文件處理 API

```javascript
// Excel 文件處理
const workbook = XLSX.read(data, { type: "array" });
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// CSV 文件處理
const csvData = XLSX.read(text, { type: "string" });
```

## 🛠️ 技術棧

- 前端：

  - HTML5/CSS3
  - Vanilla JavaScript
  - Web Speech API
  - SheetJS (XLSX)

- 後端：

  - Node.js
  - Express.js
  - Google Gemini API

- 工具和庫：
  - XLSX.js (Excel/CSV 處理)
  - Font Awesome (圖標)
  - Google Fonts

## 📱 響應式設計

- 支援所有主流設備
- 自適應布局
- 觸摸友好界面
- 優化的移動端體驗

## 🔒 安全性

- API 金鑰安全存儲
- 環境變數保護
- 文件上傳驗證
- 錯誤處理機制

## 🔄 更新日誌

### 最新版本

- 添加 CSV 文件支援
- 增強數據分析功能
- 優化 AI 分析報告
- 改進用戶界面
- 添加數據統計功能

## 📝 開發計劃

- [ ] 添加數據可視化圖表
- [ ] 支援更多文件格式
- [ ] 批量文件處理
- [ ] 數據導出功能
- [ ] 自定義分析模板

## 🤝 貢獻指南

1. Fork 本專案
2. 創建特性分支
3. 提交更改
4. 推送到分支
5. 創建 Pull Request

## 📄 授權協議

本專案採用 MIT 授權協議 - 查看 [LICENSE](LICENSE) 文件了解更多詳情。

## 👥 作者

- 您的名字 - [您的郵箱]

## 🙏 致謝

- Google Gemini API
- SheetJS 團隊
- 所有貢獻者

## 💡 問題反饋

如果您發現任何問題或有改進建議，請：

1. 檢查 Issues 是否已存在相關問題
2. 創建新的 Issue 並詳細描述問題
3. 提供復現步驟和相關信息

---

Made with ❤️ by [Your Name]
