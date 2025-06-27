// models/eventModel.js

const db = require('./db');

/**
 * Fetch all events for a given project, ordered by display_order.
 * @param {number} projectId
 * @param {function} cb   (err, rows) => void
 */
exports.getAll = (projectId, cb) => {
  db.all(
    `SELECT id, title, description, event_date, is_abstract, display_order
       FROM events
      WHERE project_id = ?
      ORDER BY is_abstract DESC, display_order ASC, event_date ASC`,
    [projectId],
    cb
  );
};

/**
 * Fetch a single event by its ID.
 * @param {number} id
 * @param {function} cb   (err, row) => void
 */
exports.getById = (id, cb) => {
  db.get(
    `SELECT id, title, description, event_date, is_abstract, display_order
       FROM events
      WHERE id = ?`,
    [id],
    cb
  );
};

/**
 * Create a new event.
 * @param {number} projectId
 * @param {string} title
 * @param {string} description
 * @param {string|null} eventDate    ISO date or free text
 * @param {boolean} isAbstract
 * @param {number} displayOrder
 * @param {function} cb   (err, { id }) => void
 */
exports.create = (projectId, title, description, eventDate, isAbstract, displayOrder, cb) => {
  db.run(
    `INSERT INTO events
       (project_id, title, description, event_date, is_abstract, display_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [projectId, title, description, eventDate, isAbstract ? 1 : 0, displayOrder || 0],
    function(err) {
      cb(err, { id: this.lastID });
    }
  );
};

/**
 * Update an existing event.
 * @param {number} id
 * @param {string} title
 * @param {string} description
 * @param {string|null} eventDate
 * @param {boolean} isAbstract
 * @param {number} displayOrder
 * @param {function} cb   (err) => void
 */
exports.update = (id, title, description, eventDate, isAbstract, displayOrder, cb) => {
  db.run(
    `UPDATE events
        SET title        = ?,
            description  = ?,
            event_date   = ?,
            is_abstract  = ?,
            display_order = ?,
            updated_at   = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [title, description, eventDate, isAbstract ? 1 : 0, displayOrder || 0, id],
    cb
  );
};

/**
 * Delete an event.
 * @param {number} id
 * @param {function} cb   (err) => void
 */
exports.delete = (id, cb) => {
  db.run(`DELETE FROM events WHERE id = ?`, [id], cb);
};