const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'));

// Initialize database schema if it does not exist
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  // Projects table
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Parts table (book parts / volumes)
  db.run(`CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // Drafts table (chapters)
  db.run(`CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    part_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    last_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id),
    FOREIGN KEY(part_id)    REFERENCES parts(id)
  )`);

  // Notes table
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    title TEXT,
    content TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // Characters table
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

  // Health history table
  db.run(`CREATE TABLE IF NOT EXISTS health_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER,
    event TEXT,
    date TEXT,
    FOREIGN KEY(character_id) REFERENCES characters(id)
  )`);

  // Character relationships table
  db.run(`CREATE TABLE IF NOT EXISTS character_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER,
    related_character_id INTEGER,
    relation TEXT,
    FOREIGN KEY(character_id) REFERENCES characters(id),
    FOREIGN KEY(related_character_id) REFERENCES characters(id)
  )`);

  // Preferences table
  db.run(`CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    autosave_interval INTEGER DEFAULT 2,
    show_status_bar INTEGER DEFAULT 1,
    font_choice TEXT DEFAULT 'Manrope',
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Migrate existing characters table if needed (silent failures)
  db.run(`ALTER TABLE characters ADD COLUMN goal TEXT`,         () => {});
  db.run(`ALTER TABLE characters ADD COLUMN character_type TEXT`,() => {});
  db.run(`ALTER TABLE characters ADD COLUMN motivation TEXT`,   () => {});
  db.run(`ALTER TABLE characters ADD COLUMN fears TEXT`,        () => {});
  db.run(`ALTER TABLE characters ADD COLUMN weaknesses TEXT`,   () => {});
  db.run(`ALTER TABLE characters ADD COLUMN arc TEXT`,          () => {});
  db.run(`ALTER TABLE characters ADD COLUMN secrets TEXT`,      () => {});
  db.run(`ALTER TABLE characters ADD COLUMN allies TEXT`,       () => {});
  db.run(`ALTER TABLE characters ADD COLUMN enemies TEXT`,      () => {});

  // Ensure drafts has part_id (silent if already exists)
  db.run(`ALTER TABLE drafts ADD COLUMN part_id INTEGER`, () => {});

  // Ensure drafts has creation and update timestamps (silent if already exists)
  db.run(`ALTER TABLE drafts ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP`, () => {});
  db.run(`ALTER TABLE drafts ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP`, () => {});
});

module.exports = db;
