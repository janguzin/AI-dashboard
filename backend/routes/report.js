// backend/routes/report.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// 리포트 API (이상치 기록 조회)
router.get("/", (req, res) => {
  db.all("SELECT * FROM alerts ORDER BY timestamp DESC", (err, rows) => {
    if (err) {
      console.error("DB 조회 오류:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
