const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// HTTP 서버 + WebSocket 서버 함께 실행
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// 예측 기준
const PREDICT_THRESHOLD = 1300;

// 클라이언트 연결 시
io.on("connection", (socket) => {
  console.log("✅ 클라이언트 연결됨:", socket.id);

  // 5초마다 데이터 전송 (실제 환경에선 센서/DB 연동)
  setInterval(() => {
    const usage = Math.floor(Math.random() * 1600) + 800; // 가짜 측정값
    console.log("측정값:", usage);

    if (usage > PREDICT_THRESHOLD) {
      socket.emit("alert", {
        usage,
        message: `⚠️ 예측치를 초과했습니다 (${usage} kWh)`
      });
    } else {
      socket.emit("data", { usage });
    }
  }, 5000);
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
