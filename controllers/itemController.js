// controllers/itemController.js — Handles item management operations

const itemModel = require('../models/itemModel');
const ITEM_STATUSES = ['active', 'lost', 'destroyed', 'custom'];

/**
 * Show list of items (HTML).
 */
exports.list = (req, res) => {
  const { projectId } = req.params;
  itemModel.getAll(projectId, (err, items) => {
    if (err) {
      console.error('❌ DB error loading items:', err);
      return res.sendStatus(500);
    }
    res.render('items/list', { title: 'Items', items, projectId });
  });
};

/**
 * Return JSON for AJAX (editor panel).
 */
exports.jsonList = (req, res) => {
  const { projectId } = req.params;
  itemModel.getAll(projectId, (err, items) => {
    if (err) {
      console.error('❌ DB error loading items (JSON):', err);
      return res.sendStatus(500);
    }
    res.json({ success: true, items });
  });
};

/**
 * Return JSON detail for a single item (for modal).
 */
exports.jsonDetail = (req, res) => {
  const { id } = req.params;
  itemModel.getById(id, (err, item) => {
    if (err) {
      console.error('❌ DB error loading item detail:', err);
      return res.sendStatus(500);
    }
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, item });
  });
};

/**
 * Render “new” or “edit” form.
 * AJAX → form-modal.ejs, otherwise form-page.ejs
 */
exports.form = (req, res) => {
  const { projectId, id } = req.params;
  const data = { projectId, statuses: ITEM_STATUSES };

  if (id) {
    // edit
    itemModel.getById(id, (err, item) => {
      if (err || !item) return res.sendStatus(404);
      data.item = item;
      data.title = 'Edit Item';
      if (req.xhr) return res.render('items/form-modal', data);
      res.render('items/form-page', data);
    });
  } else {
    // new
    data.item = { name:'', status:'active', custom_status:'', description:'' };
    data.title = 'Add Item';
    if (req.xhr) return res.render('items/form-modal', data);
    res.render('items/form-page', data);
  }
};

/**
 * Create a new item.
 */
exports.create = (req, res) => {
  const { projectId } = req.params;
  const { name, status, customStatus, description } = req.body;
  const finalStatus = status === 'custom' ? 'custom' : status;
  const custom_status = status === 'custom' ? customStatus : '';

  itemModel.create(
    projectId,
    name,
    finalStatus,
    custom_status,
    description,
    (err, result) => {
      if (err) {
        console.error('❌ Error creating item:', err);
        return res.sendStatus(500);
      }
      const item = { id: result.id, name, status: finalStatus, custom_status, description };
      if (req.xhr) return res.json({ success: true, item });
      res.redirect(`/items/${projectId}`);
    }
  );
};

/**
 * Update an existing item.
 */
exports.update = (req, res) => {
  const { projectId, id } = req.params;
  const { name, status, customStatus, description } = req.body;
  const finalStatus = status === 'custom' ? 'custom' : status;
  const custom_status = status === 'custom' ? customStatus : '';

  itemModel.update(
    id,
    name,
    finalStatus,
    custom_status,
    description,
    err => {
      if (err) {
        console.error('❌ Error updating item:', err);
        return res.sendStatus(500);
      }
      const item = { id: Number(id), name, status: finalStatus, custom_status, description };
      if (req.xhr) return res.json({ success: true, item });
      res.redirect(`/items/${projectId}`);
    }
  );
};

/**
 * Delete an item.
 */
exports.delete = (req, res) => {
  const { projectId, id } = req.params;
  itemModel.delete(id, err => {
    if (err) {
      console.error('❌ Error deleting item:', err);
      return res.sendStatus(500);
    }
    res.redirect(`/items/${projectId}`);
  });
};
