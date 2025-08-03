// controllers/itemController.js — Handles item management operations

const itemModel = require('../models/itemModel');

// Supported item statuses
const ITEM_STATUSES = ['active', 'lost', 'destroyed', 'custom'];

/**
 * Add display_status to items list, using translations
 */
function addDisplayStatus(req, items) {
  return items.map(item => ({
    ...item,
    display_status: item.status === 'custom'
      ? item.custom_status
      : req.__('Items.Status.' + item.status)
  }));
}

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

    const itemsWithStatus = addDisplayStatus(req, items);

    res.render('items/list', {
      title: req.__('Items.List.title'),
      items: itemsWithStatus,
      projectId
    });
  });
};

/**
 * Return items list as JSON for AJAX (used in editor sidebar).
 */
exports.jsonList = (req, res) => {
  const { projectId } = req.params;

  itemModel.getAll(projectId, (err, items) => {
    if (err) {
      console.error('❌ DB error loading items (JSON):', err);
      return res.sendStatus(500);
    }

    const itemsWithStatus = addDisplayStatus(req, items);
    res.json({ success: true, items: itemsWithStatus });
  });
};

/**
 * Return item detail as JSON (used in modal).
 */
exports.jsonDetail = (req, res) => {
  const { id } = req.params;

  itemModel.getById(id, (err, item) => {
    if (err) {
      console.error('❌ DB error loading item detail:', err);
      return res.sendStatus(500);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        error: req.__('Items.NotFound')
      });
    }

    item.display_status = item.status === 'custom'
      ? item.custom_status
      : req.__('Items.Status.' + item.status);

    res.json({ success: true, item });
  });
};

/**
 * Render the item form (new or edit).
 */
exports.form = (req, res) => {
  const { projectId, id } = req.params;
  const data = {
    projectId,
    statuses: ITEM_STATUSES
  };

  if (id) {
    // Edit mode
    itemModel.getById(id, (err, item) => {
      if (err || !item) return res.sendStatus(404);
      data.item = item;
      data.title = req.__('Items.Edit.title');
      if (req.xhr) return res.render('items/form-modal', data);
      res.render('items/form-page', data);
    });
  } else {
    // New mode
    data.item = {
      name: '',
      status: 'active',
      custom_status: '',
      description: ''
    };
    data.title = req.__('Items.New.title');
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

      const item = {
        id: result.id,
        name,
        status: finalStatus,
        custom_status,
        description,
        display_status: finalStatus === 'custom'
          ? custom_status
          : req.__('Items.Status.' + finalStatus)
      };

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

      const item = {
        id: Number(id),
        name,
        status: finalStatus,
        custom_status,
        description,
        display_status: finalStatus === 'custom'
          ? custom_status
          : req.__('Items.Status.' + finalStatus)
      };

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
