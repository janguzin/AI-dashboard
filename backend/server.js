// ✅ 1. 모듈 불러오기
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const csv = require("csv-parser");
const cors = require("cors");

// ✅ 2. 서버 세팅
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ CSV 로드 함수 (파일명, time/usage 배열로 반환)
function loadCsv(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row["Usage_15min"] && row["Local Time"]) {
          data.push({
            time: row["Local Time"],
            usage: Number(row["Usage_15min"])
          });
        }
      })
      .on("end", () => {
        console.log(`📂 ${filePath} 로드 완료 (${data.length}개)`);
        resolve(data);
      })
      .on("error", reject);
  });
}

// ✅ 3. CSV 데이터 로드 (실시간 전송용: 2508.csv)
let csvData = [];
loadCsv("2508.csv").then((data) => {
  csvData = data;
});

// ✅ 4. 비교용 API (2408, 2507, 2508 불러오기)
app.get("/api/comparison", async (req, res) => {
  try {
    const data2408 = await loadCsv("2408.csv");
    const data2507 = await loadCsv("2507.csv");
    const data2508 = await loadCsv("2508.csv");

    res.json({ data2408, data2507, data2508 });
  } catch (err) {
    console.error("❌ CSV 불러오기 실패:", err);
    res.status(500).json({ error: "CSV 불러오기 실패" });
  }
});

// ✅ 5. 소켓 통신 (실시간 데이터 전송: 2508.csv)
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

// ✅ 6. 서버 실행
server.listen(4000, () => {
  console.log("🚀 서버 실행 중: http://localhost:4000");
});
