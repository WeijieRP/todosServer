const express = require("express");
const mysql2 = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();


const PORT = process.env.DB_PORT || 3000;
const app = express();


const dbConfig = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(express.json());


// -------------------- CORS --------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.REACT_APP_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
  })
);
// ================== GET ALL ==================
app.get("/todos", async (req, res) => {
  try {
    const [rows] = await dbConfig.execute("SELECT * FROM todos ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== INSERT ==================
app.post("/todos", async (req, res) => {
  try {
    const { name, task, description, priority } = req.body;

    const [result] = await dbConfig.execute(
      "INSERT INTO todos (name, task, description, priority) VALUES (?, ?, ?, ?)",
      [name, task, description, priority]
    );

    res.json({
      message: "Todo created successfully",
      insertId: result.insertId,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== UPDATE ==================
app.put("/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, task, description, priority } = req.body;

    const [result] = await dbConfig.execute(
      "UPDATE todos SET name=?, task=?, description=?, priority=? WHERE id=?",
      [name, task, description, priority, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Todo not found" });

    res.json({ message: "Todo updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== DELETE ==================
app.delete("/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await dbConfig.execute(
      "DELETE FROM todos WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Todo not found" });

    res.json({ message: "Todo deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== 404 ==================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});