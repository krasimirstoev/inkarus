// controllers/placeController.js - Handles place management operations

const locationModel = require('../models/locationModel');

const PLACE_TYPES = [
  'city',
  'village',
  'country',
  'continent',
  'mountain',
  'river',
  'sea',
  'lake',
  'forest',
  'desert',
  'region',
  'island',
  'planet',
  'custom'
];

/**
 * Show list of places for a project.
 */
exports.list = (req, res) => {
  const { projectId } = req.params;
  locationModel.getAll(projectId, (err, places) => {
    if (err) {
      console.error('❌ DB error loading places:', err);
      return res.sendStatus(500);
    }
    res.render('places/list', {
      title:      'Places',
      places,
      projectId
    });
  });
};

/**
 * Return JSON list of places for AJAX (editor panel).
 */
exports.jsonList = (req, res) => {
  const { projectId } = req.params;
  locationModel.getAll(projectId, (err, places) => {
    if (err) return res.sendStatus(500);
    res.json({ success: true, places });
  });
};

/**
 * Show form for creating a new place or editing an existing one.
 */
exports.form = (req, res) => {
  const { projectId, id } = req.params;
  if (id) {
    // Edit existing
    locationModel.getById(id, (err, place) => {
      if (err || !place) {
        console.error('❌ Place not found or DB error:', err);
        return res.sendStatus(404);
      }
      res.render('places/form', {
        title:      'Edit Place',
        place,
        projectId,
        types:      PLACE_TYPES
      });
    });
  } else {
    // New place
    res.render('places/form', {
      title:      'New Place',
      place:      {},
      projectId,
      types:      PLACE_TYPES
    });
  }
};

/**
 * Create a new place.
 */
exports.create = (req, res) => {
  const { projectId } = req.params;
  const { name, type, customType, description } = req.body;
  const finalType = type === 'custom' ? customType : type;

  locationModel.create(
    projectId,
    name,
    finalType,
    description,
    (err, result) => {
      if (err) {
        console.error('❌ Error creating place:', err);
        return res.sendStatus(500);
      }
      res.redirect(`/places/${projectId}`);
    }
  );
};

/**
 * Update an existing place.
 */
exports.update = (req, res) => {
  const { projectId, id } = req.params;
  const { name, type, customType, description } = req.body;
  const finalType = type === 'custom' ? customType : type;

  locationModel.update(
    id,
    name,
    finalType,
    description,
    err => {
      if (err) {
        console.error('❌ Error updating place:', err);
        return res.sendStatus(500);
      }
      res.redirect(`/places/${projectId}`);
    }
  );
};

/**
 * Delete a place.
 */
exports.delete = (req, res) => {
  const { projectId, id } = req.params;
  locationModel.delete(id, err => {
    if (err) {
      console.error('❌ Error deleting place:', err);
      return res.sendStatus(500);
    }
    res.redirect(`/places/${projectId}`);
  });
};
