const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// CSV 데이터 로드 (차분 없음, 그대로 사용)
let csvData = [];
fs.createReadStream("2508.csv")
  .pipe(csv())
  .on("data", (row) => {
    if (row["Usage_15min"]) {  // ✅ 15분 단위 사용량 그대로 push
      csvData.push(Number(row["Usage_15min"]));
    }
  })
  .on("end", () => {
    console.log("CSV 파일 로드 완료 ✅ 데이터 개수:", csvData.length);
  });

// 클라이언트 연결 시
io.on("connection", (socket) => {
  console.log("✅ 클라이언트 연결됨:", socket.id);

  let index = 0;

  // 1초마다 한 줄씩 전송
  const interval = setInterval(() => {
    if (index < csvData.length) {
      const usage = csvData[index];
      socket.emit("data", { usage });
      console.log("📊 전송:", usage);
      index++;
    } else {
      clearInterval(interval);
      console.log("✅ CSV 데이터 끝");
    }
  }, 1000);

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("❌ 클라이언트 연결 해제:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("🚀 서버 실행 중: http://localhost:4000");
});
