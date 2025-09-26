const { checkPrediction } = require("../utils/predictor");

let sampleData = [
  { time: "12:00", usage: 1250 }, 
  { time: "13:00", usage: 1500 }
];

exports.getEnergyData = (req, res) => {
  const latest = sampleData[sampleData.length - 1];
  const predictionResult = checkPrediction(latest.usage);

  res.json({
    data: sampleData,
    alert: predictionResult.alert,
    message: predictionResult.message
  });
};
