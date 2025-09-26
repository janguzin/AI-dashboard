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

// CSV 데이터 로드
let csvData = [];
fs.createReadStream("2508_M_7_01.csv")
  .pipe(csv())
  .on("data", (row) => {
    if (row["Real Energy Into the Load"]) {
      csvData.push(Number(row["Real Energy Into the Load"]));
    }
  })
  .on("end", () => {
    console.log("CSV 파일 로드 완료. 원본 데이터 개수:", csvData.length);

    // ✅ 적산 → 차분 변환
    let diffData = [];
    for (let i = 1; i < csvData.length; i++) {
      const diff = csvData[i] - csvData[i - 1];
      if (diff >= 0) {   // 음수는 제거 (센서 리셋 등)
        diffData.push(diff);
      }
    }

    csvData = diffData;
    console.log("차분 데이터 변환 완료. 최종 데이터 개수:", csvData.length);
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
