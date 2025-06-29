// Chat Interface - 使用全局變量方式
class ChatInterface {
  constructor() {
    this.chatMessages = document.getElementById("chatMessages");
    this.userInput = document.getElementById("userInput");
    this.sendButton = document.getElementById("sendButton");
    this.recordButton = document.getElementById("recordButton");
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];

    this.initializeEventListeners();

    // 等待配置載入完成後再初始化
    this.waitForConfig();
  }

  async waitForConfig() {
    let attempts = 0;
    const maxAttempts = 50; // 最多等待 5 秒

    const checkConfig = () => {
      const apiKey = window.GEMINI_API_KEY;
      console.log("🔍 檢查配置狀態:", {
        apiKey: apiKey
          ? apiKey.length > 10
            ? apiKey.substring(0, 10) + "..."
            : apiKey
          : "未設置",
        isReady:
          apiKey && apiKey !== "loading..." && apiKey !== "your_api_key_here",
      });

      if (apiKey && apiKey !== "loading..." && apiKey !== "your_api_key_here") {
        console.log("✅ 配置已就緒，開始初始化聊天功能");
        this.waitForGoogleGenAI();
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`⏳ 等待配置載入... (${attempts}/${maxAttempts})`);
        setTimeout(checkConfig, 100);
      } else {
        console.error("❌ 配置載入超時");
        this.showErrorMessage(
          "配置載入失敗，請檢查 .env 文件中的 GEMINI_API_KEY 設定"
        );
      }
    };

    checkConfig();
  }

  async waitForGoogleGenAI() {
    let attempts = 0;
    const maxAttempts = 20; // 最多等待 2 秒

    const checkAPI = () => {
      if (typeof window.GoogleGenAI !== "undefined") {
        console.log("✅ GoogleGenAI 已可用，開始初始化聊天功能");
        this.initializeGeminiChat();
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`⏳ 等待 GoogleGenAI 載入... (${attempts}/${maxAttempts})`);
        setTimeout(checkAPI, 100);
      } else {
        console.error("❌ GoogleGenAI 載入超時");
        this.showErrorMessage("API 載入失敗，請重新載入頁面");
      }
    };

    checkAPI();
  }

  initializeGeminiChat() {
    try {
      // 檢查 GeminiChat 是否可用
      if (typeof window.GeminiChat === "undefined") {
        console.error("GeminiChat 類別未載入");
        this.showErrorMessage("聊天功能初始化失敗，請重新載入頁面");
        return;
      }

      // Initialize Gemini Chat
      this.geminiChat = new window.GeminiChat();
      console.log("✅ 聊天介面初始化成功");

      // 顯示歡迎訊息
      this.addMessage(
        "✅ AI 聊天功能已就緒！您可以開始對話了。",
        "ai-message success"
      );
    } catch (error) {
      console.error("聊天初始化錯誤:", error);
      this.showErrorMessage("聊天功能初始化失敗: " + error.message);
    }
  }

  initializeEventListeners() {
    if (this.sendButton) {
      this.sendButton.addEventListener("click", () => this.handleSendMessage());
    }

    if (this.recordButton) {
      this.recordButton.addEventListener("click", () => this.toggleRecording());
    }

    if (this.userInput) {
      this.userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }
  }

  async handleSendMessage() {
    const message = this.userInput.value.trim();
    if (message && this.geminiChat) {
      // Add user message to chat
      this.addMessage(message, "user-message");
      this.userInput.value = "";

      try {
        // Show loading indicator
        this.showLoadingIndicator();

        // Get response from Gemini
        const response = await this.geminiChat.sendMessage(message);

        // Hide loading indicator
        this.hideLoadingIndicator();

        // Add AI response to chat
        this.addMessage(response, "ai-message");
      } catch (error) {
        console.error("Error getting AI response:", error);
        this.hideLoadingIndicator();
        this.addMessage(
          "抱歉，我遇到了錯誤: " + error.message,
          "ai-message error"
        );
      }
    } else if (!this.geminiChat) {
      this.showErrorMessage("聊天功能尚未初始化，請稍候或重新載入頁面");
    }
  }

  async toggleRecording() {
    if (!this.isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.addEventListener("dataavailable", (event) => {
          this.audioChunks.push(event.data);
        });

        this.mediaRecorder.addEventListener("stop", () => {
          this.processAudioRecording();
        });

        this.mediaRecorder.start();
        this.isRecording = true;
        this.recordButton.innerHTML = '<i class="fas fa-stop"></i>';
        this.recordButton.classList.add("recording");
      } catch (error) {
        console.error("Error accessing microphone:", error);
        this.addMessage(
          "系統: 無法存取麥克風。請檢查權限設定。",
          "ai-message error"
        );
      }
    } else {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.recordButton.innerHTML = '<i class="fas fa-microphone"></i>';
      this.recordButton.classList.remove("recording");
    }
  }

  async processAudioRecording() {
    const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
    try {
      if (!this.geminiChat) {
        throw new Error("聊天功能尚未初始化");
      }

      // Show loading indicator
      this.showLoadingIndicator();

      // Process audio with Gemini
      const response = await this.geminiChat.processVoiceRecording(audioBlob);

      // Hide loading indicator
      this.hideLoadingIndicator();

      // Add AI response to chat
      this.addMessage(response, "ai-message");
    } catch (error) {
      console.error("Error processing audio:", error);
      this.hideLoadingIndicator();
      this.addMessage(
        "抱歉，處理語音訊息時發生錯誤: " + error.message,
        "ai-message error"
      );
    }
  }

  addMessage(text, className) {
    if (!this.chatMessages) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    messageDiv.textContent = text;
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  showLoadingIndicator() {
    if (!this.chatMessages) return;

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message ai-message loading";
    loadingDiv.innerHTML =
      '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    this.chatMessages.appendChild(loadingDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  hideLoadingIndicator() {
    if (!this.chatMessages) return;

    const loadingDiv = this.chatMessages.querySelector(".loading");
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  showErrorMessage(message) {
    this.addMessage("系統錯誤: " + message, "ai-message error");
  }
}

// Initialize chat interface when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // 稍微延遲確保所有腳本都載入完成
  setTimeout(() => {
    try {
      const chat = new ChatInterface();
      console.log("✅ 聊天介面已啟動");
    } catch (error) {
      console.error("❌ 聊天介面啟動失敗:", error);
    }
  }, 200);
});
