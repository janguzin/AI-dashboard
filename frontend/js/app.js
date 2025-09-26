// 서버와 WebSocket 연결
const socket = io("http://localhost:4000");

// 정상 데이터 수신
socket.on("data", (res) => {
  console.log("📊 현재 전력 사용량:", res.usage);
  // 차트 업데이트 로직 연결 가능
});

// 예측 초과 알림 수신
socket.on("alert", (res) => {
  console.log("🚨 알림:", res.message);
  showPopup(res.message);
});

// 팝업 띄우기 함수
function showPopup(message) {
  // 간단하게 alert() 사용
  // alert(message);

  // Tailwind 모달 형식으로 커스텀 UI 가능
  const popup = document.createElement("div");
  popup.className =
    "fixed top-5 right-5 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50";
  popup.innerText = message;

  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 5000); // 5초 후 사라짐
}
