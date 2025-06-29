// Gemini Chat Class - 使用最新的官方 API
class GeminiChat {
  constructor() {
    // 偵錯：列出所有可用的全域變數
    console.log("🔍 檢查可用的 Google API 全域變數:");
    console.log("window.GoogleGenAI:", typeof window.GoogleGenAI);
    console.log("window.GoogleGenerativeAI:", typeof window.GoogleGenerativeAI);
    console.log("window.google:", typeof window.google);

    // 獲取 API 金鑰
    const apiKey = window.GEMINI_API_KEY || window.process?.env?.GEMINI_API_KEY;
    console.log("🔑 API 金鑰狀態:", apiKey ? "已找到" : "❌ 未設置");

    if (!apiKey || apiKey === "your_api_key_here") {
      throw new Error("請在 js/config.js 中設置您的 Gemini API 金鑰");
    }

    // 嘗試多種可能的全域變數名稱
    let GoogleAPIClass = null;
    if (typeof window.GoogleGenAI !== "undefined") {
      GoogleAPIClass = window.GoogleGenAI;
      console.log("✅ 使用 GoogleGenAI");
    } else if (typeof window.GoogleGenerativeAI !== "undefined") {
      GoogleAPIClass = window.GoogleGenerativeAI;
      console.log("✅ 使用 GoogleGenerativeAI (舊版)");
    } else if (typeof GoogleGenAI !== "undefined") {
      GoogleAPIClass = GoogleGenAI;
      console.log("✅ 使用全域 GoogleGenAI");
    } else if (typeof GoogleGenerativeAI !== "undefined") {
      GoogleAPIClass = GoogleGenerativeAI;
      console.log("✅ 使用全域 GoogleGenerativeAI");
    }

    if (!GoogleAPIClass) {
      console.error("❌ 所有可能的 Google API 類別都未找到");
      console.log(
        "可用的全域變數：",
        Object.keys(window).filter(
          (key) => key.includes("Google") || key.includes("genai")
        )
      );
      throw new Error(
        "Google Generative AI 未載入，請檢查 CDN 腳本是否正確載入"
      );
    }

    try {
      // 使用找到的 API 類別和金鑰初始化
      this.ai = new GoogleAPIClass({ apiKey: apiKey });
      this.chatHistory = [];
      console.log("✅ Gemini API 初始化成功");
    } catch (error) {
      console.error("❌ Gemini API 初始化失敗:", error);
      throw new Error("無法初始化 Gemini API：" + error.message);
    }
  }

  async analyzeFileData(data, fileType) {
    try {
      const analysisPrompt = this.generateAnalysisPrompt(data, fileType);
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: analysisPrompt,
      });

      return response.text;
    } catch (error) {
      console.error("AI分析錯誤:", error);
      throw new Error("AI分析失敗: " + error.message);
    }
  }

  generateAnalysisPrompt(data, fileType) {
    const headers = Object.keys(data[0]);
    const totalRows = data.length;
    const sampleSize = Math.min(5, totalRows);
    const sampleData = data.slice(0, sampleSize);

    // 計算每個欄位的基本統計信息
    const columnStats = this.calculateColumnStats(data, headers);

    // 生成詳細的提示文本
    let prompt = `請分析這份${fileType.toUpperCase()}數據文件，並提供詳細的見解。

文件概況：
- 總行數：${totalRows}
- 欄位數：${headers.length}
- 欄位名稱：${headers.join(", ")}

數據統計：
${this.formatColumnStats(columnStats)}

數據預覽（前${sampleSize}行）：
${this.formatSampleData(sampleData)}

請提供以下分析：
1. 這份數據的主要內容和用途是什麼？
2. 數據的主要特徵和模式是什麼？
3. 有哪些重要的觀察發現？
4. 數據品質如何（完整性、一致性等）？
5. 各欄位之間可能存在什麼關聯？
6. 這些數據可能適合用於什麼分析或應用？

請用繁體中文回答，並盡可能提供具體的見解。如果發現任何異常或特殊模式，也請指出。`;

    return prompt;
  }

  calculateColumnStats(data, headers) {
    const stats = {};

    headers.forEach((header) => {
      const values = data
        .map((row) => row[header])
        .filter((val) => val !== undefined && val !== null && val !== "");

      stats[header] = {
        type: this.getColumnType(values),
        uniqueCount: new Set(values).size,
        nonEmptyCount: values.length,
        emptyCount: data.length - values.length,
      };

      // 根據數據類型計算額外統計
      if (stats[header].type === "number") {
        const numbers = values.map((v) => Number(v)).filter((n) => !isNaN(n));
        if (numbers.length > 0) {
          stats[header].min = Math.min(...numbers);
          stats[header].max = Math.max(...numbers);
          stats[header].average =
            numbers.reduce((a, b) => a + b, 0) / numbers.length;
        }
      } else if (stats[header].type === "date") {
        const dates = values.map((v) => new Date(v)).filter((d) => !isNaN(d));
        if (dates.length > 0) {
          stats[header].earliest = new Date(Math.min(...dates));
          stats[header].latest = new Date(Math.max(...dates));
        }
      }
    });

    return stats;
  }

  getColumnType(values) {
    if (values.length === 0) return "unknown";

    const sample = values[0];
    if (!isNaN(Date.parse(sample))) {
      // 檢查是否所有值都是有效日期
      const allDates = values.every((v) => !isNaN(Date.parse(v)));
      if (allDates) return "date";
    }

    if (!isNaN(Number(sample))) {
      // 檢查是否所有值都是數字
      const allNumbers = values.every((v) => !isNaN(Number(v)));
      if (allNumbers) return "number";
    }

    return "text";
  }

  formatColumnStats(stats) {
    let result = "";
    for (const [header, stat] of Object.entries(stats)) {
      result += `\n${header}：
- 數據類型：${this.translateType(stat.type)}
- 唯一值數量：${stat.uniqueCount}
- 非空值數量：${stat.nonEmptyCount}
- 空值數量：${stat.emptyCount}`;

      if (stat.type === "number") {
        result += `
- 最小值：${stat.min}
- 最大值：${stat.max}
- 平均值：${stat.average.toFixed(2)}`;
      } else if (stat.type === "date") {
        result += `
- 最早日期：${stat.earliest.toLocaleDateString()}
- 最晚日期：${stat.latest.toLocaleDateString()}`;
      }
    }
    return result;
  }

  formatSampleData(sampleData) {
    return sampleData
      .map((row, index) => {
        const values = Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        return `行 ${index + 1}: ${values}`;
      })
      .join("\n");
  }

  translateType(type) {
    const types = {
      number: "數字",
      text: "文本",
      date: "日期",
      unknown: "未知",
    };
    return types[type] || type;
  }

  async sendMessage(message, fileData = null) {
    try {
      let response;

      if (fileData && typeof fileData === "object") {
        // 如果是文件數據，使用專門的分析方法
        const fileType = fileData.fileType || "unknown";
        response = await this.analyzeFileData(fileData.data, fileType);
      } else {
        // 一般對話
        const result = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: message,
        });
        response = result.text;
      }

      return response;
    } catch (error) {
      console.error("Gemini API 錯誤:", error);
      throw new Error("無法獲得 AI 回應: " + error.message);
    }
  }

  async processVoiceRecording(audioBlob) {
    try {
      // 檢查瀏覽器是否支援語音識別
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        throw new Error("瀏覽器不支援語音識別功能");
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "zh-TW";
      recognition.continuous = false;
      recognition.interimResults = false;

      return new Promise((resolve, reject) => {
        recognition.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
          try {
            const response = await this.sendMessage(transcript, true);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        };

        recognition.onerror = (event) => {
          reject(new Error("語音識別錯誤: " + event.error));
        };

        recognition.start();
      });
    } catch (error) {
      console.error("處理語音錄音錯誤:", error);
      throw new Error("無法處理語音訊息: " + error.message);
    }
  }

  clearHistory() {
    this.chatHistory = [];
  }
}

// 設為全域可用
window.GeminiChat = GeminiChat;
