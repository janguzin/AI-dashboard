// 서버와 연결
const socket = io("http://localhost:4000");

// Highcharts 차트 초기화
const chart = Highcharts.chart("realtime-chart", {
  chart: { type: "line", backgroundColor: "transparent" },
  title: { text: null },
  credits: { enabled: false },
  xAxis: {
    categories: [],
    title: { text: "시간" }
  },
  yAxis: {
    title: { text: "전력 사용량 (kWh)" }
  },
  series: [{
    name: "실시간 사용량",
    data: [],
    color: "#2563eb"
  }]
});

// 팝업 함수
function showPopup(message) {
  const popup = document.createElement("div");
  popup.className =
    "fixed top-5 right-5 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50";
  popup.innerText = message;

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 5000);
}

// === 🚨 히스토리 추가 함수 ===
function addToHistory(message) {
  const alertList = document.getElementById("alert-list");
  const li = document.createElement("li");
  li.className = "flex items-start space-x-2 p-2 border-b border-slate-200";

  li.innerHTML = `
    <div class="text-xs text-gray-500 w-20">${new Date().toLocaleTimeString()}</div>
    <div class="flex-1 text-red-600">
       <span class="font-semibold">(${message})</span>
    </div>
  `;

  // 새 알림을 맨 위에 표시
  alertList.prepend(li);
}

// 소켓 이벤트: 정상 데이터
socket.on("data", (res) => {
  const x = new Date().toLocaleTimeString();
  const y = res.usage;

  // 차트 업데이트
  chart.series[0].addPoint([x, y], true, chart.series[0].data.length >= 20);

  if (y > 1300) {
    console.log("🚨 알림 발생:", y);
    showPopup(`⚠️ 예측치를 초과했습니다 (${y} kWh)`);
    addToHistory(`${y} kWh`);
  }
});

// 소켓 이벤트: 서버에서 직접 alert 보낼 때
socket.on("alert", (res) => {
  console.log("🚨 알림:", res.message);
  showPopup(res.message);
  addToHistory(res.message);
});
