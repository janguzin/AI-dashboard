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

// 소켓 이벤트: 데이터 수신
socket.on("data", (res) => {
  console.log("📊 현재 전력 사용량:", res.usage);

  const x = new Date().toLocaleTimeString(); // 시간 라벨
  const y = res.usage;

  // 차트 업데이트 (최대 20개까지만 유지)
  chart.series[0].addPoint([x, y], true, chart.series[0].data.length >= 20);

  // 예측 기준 초과 → 팝업
  if (y > 1300) {
    showPopup(`⚠️ 예측치를 초과했습니다 (${y} kWh)`);
  }
});
