
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'auth_db',
  waitForConnections: true,
  connectionLimit: 10
});

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

// --- REGISTER ROUTE ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: "Registered", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- LIST USERS ROUTE WITH DYNAMIC SEARCH ---
app.get('/api/users', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, username, email FROM users';
    let params = [];

    if (search) {
      query += ' WHERE username LIKE ? OR email LIKE ?';
      const searchPattern = `%${search}%`;
      params = [searchPattern, searchPattern];
    }

    query += ' ORDER BY id DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// --- EDIT USER ROUTE ---
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: "Update failed" });
  }
});

// --- DELETE USER ROUTE ---
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Auth API running on http://localhost:${PORT}`));
