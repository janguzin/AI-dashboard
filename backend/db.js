const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./energy.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      usage INTEGER NOT NULL,
      message TEXT NOT NULL
    )
  `);
});

module.exports = db;
