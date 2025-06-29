// Gemini API 配置（通過後端 API 安全載入）
// 這是正確的方式來在瀏覽器中載入環境變數

// 設置環境變數供瀏覽器使用
if (typeof process === "undefined") {
  window.process = { env: {} };
}

// 從後端 API 載入配置
async function loadConfig() {
  try {
    console.log("🔧 正在從後端載入配置...");
    const response = await fetch("/api/config");

    if (response.ok) {
      const config = await response.json();

      // 設置環境變數
      Object.keys(config).forEach((key) => {
        window.process.env[key] = config[key];

        if (key === "GEMINI_API_KEY") {
          window.GEMINI_API_KEY = config[key];

          if (config[key] && config[key] !== "not_set") {
            console.log("✅ 成功從後端 API 讀取到 GEMINI_API_KEY");
            console.log(
              "🔑 API 金鑰前10字:",
              config[key].substring(0, 10) + "..."
            );
          } else {
            console.error("❌ 後端 API 返回的 GEMINI_API_KEY 未設置");
          }
        }
      });

      return config;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("❌ 從後端載入配置失敗:", error.message);
    console.warn("⚠️ 使用備用方案：直接設置 API 金鑰");

    // 備用方案：直接設置（僅用於開發）
    // ⚠️ 注意：這會在瀏覽器中暴露 API 金鑰
    const directApiKey = "AIzaSyBAV5VaAaDFYJKtZuQ_0N1pKFMDKnSPknc"; // 從.env讀取的值
    window.process.env.GEMINI_API_KEY = directApiKey;
    window.GEMINI_API_KEY = directApiKey;

    console.log("⚠️ 使用直接設置的 API 金鑰");
    return { GEMINI_API_KEY: directApiKey };
  }
}

// 載入配置並初始化
async function initializeConfig() {
  try {
    // 立即設置臨時值避免未定義錯誤
    window.GEMINI_API_KEY = "loading...";

    const config = await loadConfig();

    console.log("✅ 配置載入完成");
    console.log(
      "🔑 API 金鑰狀態:",
      window.GEMINI_API_KEY &&
        window.GEMINI_API_KEY !== "loading..." &&
        window.GEMINI_API_KEY !== "not_set"
        ? "已設置且有效"
        : "❌ 未正確設置"
    );

    // 觸發配置載入完成事件
    window.dispatchEvent(
      new CustomEvent("config-loaded", {
        detail: { config, success: true },
      })
    );
  } catch (error) {
    console.error("❌ 配置初始化失敗:", error);
    window.GEMINI_API_KEY = "error";

    window.dispatchEvent(
      new CustomEvent("config-loaded", {
        detail: { config: null, success: false, error: error.message },
      })
    );
  }
}

// 立即開始載入配置
initializeConfig();

// 導出函數供其他腳本使用
window.loadConfig = loadConfig;
window.initializeConfig = initializeConfig;
