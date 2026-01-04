
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

export const MySQLGuide: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'backend' | 'frontend' | 'sql'>('backend');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const advice = await geminiService.getAdvice(input);
    setMessages(prev => [...prev, { role: 'model', text: advice }]);
    setLoading(false);
  };

  const serverCode = `/**
 * SECURE AUTH BACKEND (Node.js + MySQL)
 * Filename: server.js
 */
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'auth_db'
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// REGISTER API
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: "Registered", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server on port 5000'));`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mastering MySQL Connectivity</h2>
        <p className="text-gray-500 mb-8">Follow this roadmap to connect your frontend to a real database.</p>
        
        <div className="flex border-b border-gray-100 mb-6">
          {(['sql', 'backend', 'frontend'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${
                activeTab === tab 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab} Setup
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'sql' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-3">1. Prepare your Database</h3>
              <p className="text-gray-600 mb-4 text-sm">Run this SQL command in your MySQL terminal or Workbench:</p>
              <div className="bg-gray-900 text-gray-100 p-5 rounded-xl font-mono text-sm shadow-inner">
                <pre>{`CREATE DATABASE auth_db;
USE auth_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-3">2. Node.js Implementation (server.js)</h3>
              <div className="mb-4 space-y-2">
                <p className="text-gray-600 text-sm">Installation commands:</p>
                <code className="block bg-gray-100 p-2 rounded text-xs font-mono">npm init -y && npm install express mysql2 bcryptjs jsonwebtoken cors dotenv</code>
              </div>
              <div className="bg-gray-900 text-gray-100 p-5 rounded-xl font-mono text-xs overflow-x-auto shadow-inner h-96 overflow-y-auto custom-scrollbar">
                <pre>{serverCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'frontend' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-3">3. Connecting the Frontend</h3>
              <p className="text-gray-600 mb-4 text-sm">Use the native <code className="bg-gray-100 px-1">fetch</code> API to talk to your Node.js server:</p>
              <div className="bg-gray-900 text-gray-100 p-5 rounded-xl font-mono text-sm shadow-inner">
                <pre>{`const login = async (email, password) => {
  const res = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    alert('Logged in!');
  }
};`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Architect Assistant (Gemini)</span>
          </div>
        </div>
        <div className="h-80 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center mt-12 text-gray-400">
              <p>Ask me how to host this on AWS, Heroku, or how to add Email verification.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm italic text-gray-400 text-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleAskGemini} className="p-4 border-t border-gray-100 flex gap-2 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about deployment or security..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
};
