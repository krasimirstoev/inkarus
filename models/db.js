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

  // Parts
  db.run(`CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);

  // Drafts
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
  db.run(`CREATE INDEX IF NOT EXISTS idx_drafts_project_id ON drafts(project_id);`);

  // Notes
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    title TEXT,
    content TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);`);

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
  db.run(`CREATE INDEX IF NOT EXISTS idx_characters_project_id ON characters(project_id);`);

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

  // Locations—with custom_type and CHECK constraint
  db.run(`CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (
      type IN (
        'city','village','country','continent',
        'mountain','river','sea','lake',
        'forest','desert','region','island',
        'planet','custom'
      )
    ),
    custom_type TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );`);

  // Events
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT,               -- ISO date or abstract text
    is_abstract INTEGER DEFAULT 0, -- 1 = abstract event
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);`);

  // Trigger to auto-update updated_at for locations
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_locations_updated_at
    AFTER UPDATE ON locations
    FOR EACH ROW
    BEGIN
      UPDATE locations
         SET updated_at = CURRENT_TIMESTAMP
       WHERE id = NEW.id;
    END;
  `);

  // Silent migrations for older tables
  db.run(`ALTER TABLE drafts ADD COLUMN "order" INTEGER DEFAULT 0`,         () => {});
  db.run(`ALTER TABLE drafts ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP`, () => {});
  db.run(`ALTER TABLE drafts ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP`, () => {});
});

module.exports = db;
