// backend/utils/predictor.js

const PREDICT_THRESHOLD = 1300;

exports.checkPrediction = (usage) => {
  if (usage > PREDICT_THRESHOLD) {
    return { alert: true, message: `⚠️ 예측치를 초과했습니다 (${usage} kWh)` };
  }
  return { alert: false, message: "정상 범위" };
};
