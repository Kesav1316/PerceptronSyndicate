require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MySQL Database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",  // Change this to your MySQL password
  database: "envirai"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    process.exit(1);
  }
  console.log("✅ MySQL Connected!");
});

// ✅ Ensure users table exists
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    level INT DEFAULT 1,
    xp INT DEFAULT 0
  )
`, (err) => {
  if (err) console.error("❌ Error creating users table:", err);
  else console.log("✅ Users table ready!");
});

// 🔹 Register a New User
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) 
    return res.status(400).json({ error: "All fields are required!" });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

  db.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Username or Email already exists!" });
      }
      return res.status(500).json({ error: "Database error!" });
    }
    res.json({ message: "✅ User registered successfully!" });
  });
});

// 🔹 User Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
    if (err || results.length === 0) 
      return res.status(401).json({ error: "Invalid username or password!" });

    const user = results[0];

    // ✅ Ensure correct column name: "password_hash"
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid username or password!" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, "secret", { expiresIn: "1h" });
    res.json({ token, user });
  });
});

// 🔹 Get User Info (XP & Level)
app.get("/user/:username", (req, res) => {
  const { username } = req.params;
  
  db.query("SELECT username, level, xp FROM users WHERE username = ?", [username], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: "User not found!" });
    res.json(results[0]);
  });
});

// 🔹 Increase XP and Level Up System
app.post("/increase-xp", (req, res) => {
  const { username, xpGained } = req.body;

  db.query("SELECT xp, level FROM users WHERE username = ?", [username], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: "User not found!" });

    let { xp, level } = results[0];
    xp += xpGained;
    let xpRequired = (level - 1) * 50 + 50; // XP required for next level

    if (xp >= xpRequired) {
      xp -= xpRequired;
      level += 1;
    }

    db.query("UPDATE users SET xp = ?, level = ? WHERE username = ?", [xp, level, username], (err) => {
      if (err) return res.status(500).json({ error: "Failed to update XP!" });
      res.json({ message: "XP updated successfully!", xp, level });
    });
  });
});

// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
