// Chat Interface - 使用全局變量方式
class ChatInterface {
  constructor() {
    this.chatMessages = document.getElementById("chatMessages");
    this.userInput = document.getElementById("userInput");
    this.sendButton = document.getElementById("sendButton");
    this.recordButton = document.getElementById("recordButton");
    this.excelFile = document.getElementById("excelFile");
    this.fileName = document.getElementById("fileName");
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

    // Excel 文件上傳處理
    if (this.excelFile) {
      this.excelFile.addEventListener("change", (e) =>
        this.handleExcelUpload(e)
      );
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

  async handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 更新文件名顯示
    this.fileName.textContent = file.name;

    try {
      // 顯示載入中訊息
      this.addMessage("正在處理文件...", "ai-message loading");

      // 根據文件類型選擇處理方法
      const fileExtension = file.name.split(".").pop().toLowerCase();
      let data;

      if (fileExtension === "csv") {
        data = await this.readCSVFile(file);
      } else {
        data = await this.readExcelFile(file);
      }

      // 移除載入中訊息
      const loadingMsg = this.chatMessages.querySelector(".loading");
      if (loadingMsg) loadingMsg.remove();

      if (!data || data.length === 0) {
        throw new Error("文件沒有數據或格式不正確");
      }

      // 創建預覽容器
      const previewDiv = document.createElement("div");
      previewDiv.className = "message ai-message excel-preview";

      // 創建表格
      const table = document.createElement("table");

      // 添加表頭
      const headers = Object.keys(data[0]);
      const headerRow = document.createElement("tr");
      headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      // 添加數據行
      data.forEach((row) => {
        const tr = document.createElement("tr");
        headers.forEach((header) => {
          const td = document.createElement("td");
          td.textContent = row[header] || "";
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });

      previewDiv.appendChild(table);
      this.chatMessages.appendChild(previewDiv);

      // 自動滾動到底部
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

      // 如果有 AI 聊天功能，發送給 AI 進行分析
      if (this.geminiChat) {
        this.addMessage("🤖 AI 正在分析您的數據...", "ai-message loading");

        try {
          const aiResponse = await this.geminiChat.sendMessage(null, {
            data: data,
            fileType: fileExtension,
          });

          // 移除載入訊息
          const loadingMsgs = this.chatMessages.querySelectorAll(".loading");
          loadingMsgs.forEach((msg) => msg.remove());

          // 添加 AI 的分析結果
          const analysisDiv = document.createElement("div");
          analysisDiv.className = "message ai-message analysis";

          // 創建標題
          const title = document.createElement("h3");
          title.textContent = "📊 數據分析報告";
          title.style.marginBottom = "10px";
          analysisDiv.appendChild(title);

          // 添加分析內容
          const content = document.createElement("div");
          content.innerHTML = aiResponse.replace(/\n/g, "<br>");
          analysisDiv.appendChild(content);

          this.chatMessages.appendChild(analysisDiv);
        } catch (error) {
          console.error("AI 分析錯誤:", error);
          this.addMessage(
            "❌ AI 分析時發生錯誤: " + error.message,
            "ai-message error"
          );
        }
      }
    } catch (error) {
      console.error("處理文件時發生錯誤:", error);
      this.addMessage(
        "處理文件時發生錯誤: " + error.message,
        "ai-message error"
      );
    }

    // 清除文件輸入，允許重複上傳相同文件
    this.excelFile.value = "";
  }

  readCSVFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target.result;
          // 使用 XLSX 的 CSV 解析功能
          const workbook = XLSX.read(text, {
            type: "string",
            raw: true,
            cellDates: true,
            dateNF: "yyyy-mm-dd",
          });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // 轉換為 JSON 格式
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: "yyyy-mm-dd",
          });

          resolve(jsonData);
        } catch (error) {
          reject(new Error("無法解析 CSV 文件: " + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error("讀取文件失敗"));
      };

      reader.readAsText(file);
    });
  }

  formatDataForAI(data, fileType) {
    // 將數據格式化為易讀的文本
    const headers = Object.keys(data[0]);
    let text = `${fileType.toUpperCase()} 文件分析：\n`;
    text += "表格標題：" + headers.join(", ") + "\n\n";

    // 基本統計信息
    text += `總行數：${data.length}\n`;
    text += `欄位數：${headers.length}\n\n`;

    // 只取前 5 行數據作為示例
    const previewRows = data.slice(0, 5);
    text += "數據預覽（前5行）：\n";
    previewRows.forEach((row, index) => {
      text += `第 ${index + 1} 行：\n`;
      headers.forEach((header) => {
        text += `${header}: ${row[header] || "空"}\n`;
      });
      text += "\n";
    });

    if (data.length > 5) {
      text += `... 還有 ${data.length - 5} 行數據 ...\n`;
    }

    // 添加數據類型信息
    text += "\n數據類型分析：\n";
    headers.forEach((header) => {
      const sampleValue = data[0][header];
      const valueType = typeof sampleValue;
      text += `${header}: ${valueType}\n`;
    });

    return text;
  }

  readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // 轉換為 JSON 格式
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          resolve(jsonData);
        } catch (error) {
          reject(new Error("無法解析 Excel 文件: " + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error("讀取文件失敗"));
      };

      reader.readAsArrayBuffer(file);
    });
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
