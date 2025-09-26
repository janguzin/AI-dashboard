// ✅ 1. 모듈 불러오기
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");        
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
    // ⚡️ 실제 헤더 이름 확인을 위해 출력
    console.log("CSV Row:", row);

    // 공백 제거해서 헤더 접근
    const time = row["Local Time"]?.trim();   // ⚡️ Local Time (언더바 ❌, 공백 ⭕)
    const usage = row["Usage_15min"]?.trim(); // ⚡️ Usage_15min

    if (time && usage) {
      csvData.push({
        time,
        usage: Number(usage)
      });
    }
  })
  .on("end", () => {
    console.log("CSV 파일 로드 완료 ✅ 최종 데이터 개수:", csvData.length);
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
