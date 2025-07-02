// models/itemModel.js — Handles item data operations

const db = require('./db');

/**
 * Get all items for a project,
 * including a computed display_status.
 */
exports.getAll = (projectId, callback) => {
  db.all(
    `SELECT
       id,
       project_id,
       name,
       description,
       status,
       custom_status,
       CASE WHEN status = 'custom' THEN custom_status ELSE status END AS display_status,
       created_at,
       updated_at
     FROM items
     WHERE project_id = ?
     ORDER BY created_at DESC`,
    [projectId],
    callback
  );
};

/**
 * Get a single item by its ID,
 * including a computed display_status.
 */
exports.getById = (id, callback) => {
  db.get(
    `SELECT
       id,
       project_id,
       name,
       description,
       status,
       custom_status,
       CASE WHEN status = 'custom' THEN custom_status ELSE status END AS display_status,
       created_at,
       updated_at
     FROM items
     WHERE id = ?`,
    [id],
    callback
  );
};

/**
 * Create a new item.
 *
 * @param {number}   projectId
 * @param {string}   name
 * @param {string}   status
 * @param {string}   customStatus
 * @param {string}   description
 * @param {function} callback(err, {id})
 */
exports.create = (projectId, name, status, customStatus, description, callback) => {
  db.run(
    `INSERT INTO items
       (project_id, name, status, custom_status, description)
     VALUES (?, ?, ?, ?, ?)`,
    [projectId, name, status, customStatus || '', description],
    function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID });
    }
  );
};

/**
 * Update an existing item.
 *
 * @param {number}   id
 * @param {string}   name
 * @param {string}   status
 * @param {string}   customStatus
 * @param {string}   description
 * @param {function} callback(err)
 */
exports.update = (id, name, status, customStatus, description, callback) => {
  db.run(
    `UPDATE items
        SET name          = ?,
            status        = ?,
            custom_status = ?,
            description   = ?,
            updated_at    = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [name, status, customStatus || '', description, id],
    callback
  );
};

/**
 * Delete an item.
 *
 * @param {number}   id
 * @param {function} callback(err)
 */
exports.delete = (id, callback) => {
  db.run(
    `DELETE FROM items WHERE id = ?`,
    [id],
    callback
  );
};
