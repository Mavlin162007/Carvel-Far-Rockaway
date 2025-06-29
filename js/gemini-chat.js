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

  async sendMessage(message, isVoice) {
    try {
      let prompt = message;

      if (isVoice) {
        prompt =
          "這是一個語音轉文字的訊息: " +
          message +
          "，請提供自然且對話式的回應。";
      }

      // 加入聊天記錄
      this.chatHistory.push({
        role: "user",
        content: message,
      });

      // 使用最新的 API 調用方式
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = response.text;

      // 加入 AI 回應到記錄
      this.chatHistory.push({
        role: "assistant",
        content: responseText,
      });

      return responseText;
    } catch (error) {
      console.error("Gemini聊天錯誤:", error);

      // 處理各種錯誤情況
      if (
        error.message.includes("API_KEY_INVALID") ||
        error.message.includes("API key")
      ) {
        throw new Error("API金鑰無效，請檢查您的金鑰設定");
      }
      if (error.message.includes("quota") || error.message.includes("limit")) {
        throw new Error("API配額已用盡，請稍後再試");
      }
      if (error.message.includes("GEMINI_API_KEY")) {
        throw new Error("請設定 GEMINI_API_KEY");
      }

      throw new Error("無法獲得AI回應：" + (error.message || "未知錯誤"));
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
