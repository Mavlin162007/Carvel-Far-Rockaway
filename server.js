import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// API endpoint to provide frontend config
app.get("/api/config", (req, res) => {
  try {
    // Only provide necessary config to frontend
    const config = {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "not_set",
      // Add other non-sensitive config here if needed
    };

    console.log(
      "🔧 配置 API 被請求，API 金鑰狀態:",
      config.GEMINI_API_KEY !== "not_set" ? "已設置" : "未設置"
    );

    res.json(config);
  } catch (error) {
    console.error("配置 API 錯誤:", error);
    res.status(500).json({ error: "無法載入配置" });
  }
});

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("✅ 配置 API 可在 http://localhost:" + PORT + "/api/config 訪問");
});
