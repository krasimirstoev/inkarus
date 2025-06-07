const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

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

  // Parts (volumes)
  db.run(`CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // Drafts (chapters)
  db.run(`CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    part_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    "order" INTEGER DEFAULT 0,
    last_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id),
    FOREIGN KEY(part_id)    REFERENCES parts(id)
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
    goal TEXT,
    character_type VARCHAR(255),
    motivation TEXT,
    fears TEXT,
    weaknesses TEXT,
    arc VARCHAR(255),
    secrets TEXT,
    allies TEXT,
    enemies TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // Health history
  db.run(`CREATE TABLE IF NOT EXISTS health_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER,
    event TEXT,
    date TEXT,
    FOREIGN KEY(character_id) REFERENCES characters(id)
  )`);

  // Character relationships
  db.run(`CREATE TABLE IF NOT EXISTS character_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER,
    related_character_id INTEGER,
    relation TEXT,
    FOREIGN KEY(character_id) REFERENCES characters(id),
    FOREIGN KEY(related_character_id) REFERENCES characters(id)
  )`);

  // Preferences
  db.run(`CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    autosave_interval INTEGER DEFAULT 2,
    show_status_bar INTEGER DEFAULT 1,
    font_choice TEXT DEFAULT 'Manrope',
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Draft revisions
  db.run(`CREATE TABLE IF NOT EXISTS draft_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  type TEXT DEFAULT 'autosave', -- autosave, manual, system
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(draft_id) REFERENCES drafts(id)
)`);

  // Silent migrations for older tables
  db.run(`ALTER TABLE drafts ADD COLUMN "order" INTEGER DEFAULT 0`,         () => {});
  db.run(`ALTER TABLE drafts ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP`, () => {});
  db.run(`ALTER TABLE drafts ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP`, () => {});
});

module.exports = db;
