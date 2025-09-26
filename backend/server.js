// ✅ 1. 모듈 불러오기
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");        // ⚡️ 여기 반드시 필요
const csv = require("csv-parser");

// ✅ 2. 서버 세팅
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ 3. CSV 데이터 로드
let csvData = [];
fs.createReadStream("2508.csv")
  .pipe(csv())
  .on("data", (row) => {
    if (row["Usage_15min"] && row["Local_Time"]) {
      csvData.push({
        time: row["Local_Time"],           // 시간 저장
        usage: Number(row["Usage_15min"])  // 사용량 저장
      });
    }
  })
  .on("end", () => {
    console.log("CSV 파일 로드 완료. 최종 데이터 개수:", csvData.length);
  });

// ✅ 4. 소켓 통신
io.on("connection", (socket) => {
  console.log("✅ 클라이언트 연결됨:", socket.id);

  let index = 0;

  const interval = setInterval(() => {
    if (index < csvData.length) {
      const { time, usage } = csvData[index];
      socket.emit("data", { time, usage });
      console.log("📊 전송:", time, usage);
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

// ✅ 5. 서버 실행
server.listen(4000, () => {
  console.log("🚀 서버 실행 중: http://localhost:4000");
});
