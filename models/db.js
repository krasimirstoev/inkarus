const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

// Init schema if not exists
db.serialize(() => {
  // Users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  // Projects
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Drafts
  db.run(`CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    last_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // Notes
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    title TEXT,
    content TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // Characters
  db.run(`CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    pseudonym TEXT,
    description TEXT,
    birthdate TEXT,
    gender TEXT,
    origin TEXT,
    location TEXT,
    occupation TEXT,
    health_status TEXT DEFAULT 'healthy',
    comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // Health Events
  db.run(`CREATE TABLE IF NOT EXISTS health_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER,
    event TEXT,
    date TEXT,
    FOREIGN KEY(character_id) REFERENCES characters(id)
  )`);

  // Character Relationships
  db.run(`CREATE TABLE IF NOT EXISTS character_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER,
    related_character_id INTEGER,
    relation TEXT,
    FOREIGN KEY(character_id) REFERENCES characters(id),
    FOREIGN KEY(related_character_id) REFERENCES characters(id)
  )`);

  // User Preferences
  db.run(`CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    autosave_interval INTEGER DEFAULT 2,
    show_status_bar INTEGER DEFAULT 1,
    font_choice TEXT DEFAULT 'Manrope',
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

module.exports = db;
