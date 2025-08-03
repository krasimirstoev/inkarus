// controllers/placeController.js — Handles place management operations

const locationModel = require('../models/locationModel');
const PLACE_TYPES = [
  'city','village','country','continent','mountain',
  'river','sea','lake','forest','desert','region',
  'island','planet','custom'
];

/**
 * Add display_type to places list, using translations
 * @param {Object} req - Request object
 * @param {Array} places - Array of place objects
 * @returns {Array} - Places with display_type added
 */

function addDisplayType(req, places) {
  return places.map(place => ({
    ...place,
    display_type: place.type === 'custom'
      ? place.custom_type
      : req.__('Places.Type.' + place.type)
  }));
}

/**
 * Show list of places (HTML).
 */
exports.list = (req, res) => {
  const { projectId } = req.params;
    locationModel.getAll(projectId, (err, placesRaw) => {
    if (err) {
      console.error('❌ DB error loading places:', err);
      return res.sendStatus(500);
    }

    const places = addDisplayType(req, placesRaw);

    res.render('places/list', {
      title: req.__('Places.Page.title'),
      places,
      projectId
    });
  });
};

/**
 * Return JSON for AJAX (editor panel).
 */
exports.jsonList = (req, res) => {
  const { projectId } = req.params;
  locationModel.getAll(projectId, (err, places) => {
    if (err) {
      console.error('❌ DB error loading places (JSON):', err);
      return res.sendStatus(500);
    }
    res.json({ success: true, places });
  });
};

/**
 * Render “new” or “edit” form.
 * AJAX → form-modal.ejs, otherwise form-page.ejs
 */
exports.form = (req, res) => {
  const { projectId, id } = req.params;
  const data = { projectId, types: PLACE_TYPES };

  if (id) {
    // edit
    locationModel.getById(id, (err, place) => {
      if (err || !place) return res.sendStatus(404);
      data.place = place;
      data.title = req.__('Places.Form.edit');
      if (req.xhr) return res.render('places/form-modal', data);
      res.render('places/form-page', data);
    });
  } else {
    // new
    data.place = { name:'', type:'', custom_type:'', description:'' };
    data.title = req.__('Places.Form.add');
    if (req.xhr) return res.render('places/form-modal', data);
    res.render('places/form-page', data);
  }
};

/**
 * Create a new place.
 */
exports.create = (req, res) => {
  const { projectId } = req.params;
  const { name, type, customType, description } = req.body;
  const finalType = type === 'custom' ? 'custom' : type;
  const custom_type = type === 'custom' ? customType : '';

  locationModel.create(
    projectId,
    name,
    finalType,
    custom_type,
    description,
    (err, result) => {
      if (err) {
        console.error('❌ Error creating place:', err);
        return res.sendStatus(500);
      }
      const place = { id: result.id, name, type: finalType, custom_type, description };
      if (req.xhr) return res.json({ success: true, place });
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
  const finalType = type === 'custom' ? 'custom' : type;
  const custom_type = type === 'custom' ? customType : '';

  locationModel.update(
    id,
    name,
    finalType,
    custom_type,
    description,
    err => {
      if (err) {
        console.error('❌ Error updating place:', err);
        return res.sendStatus(500);
      }
      const place = { id: Number(id), name, type: finalType, custom_type, description };
      if (req.xhr) return res.json({ success: true, place });
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

/**
 * Return JSON detail for a single place (for modal).
 */
exports.jsonDetail = (req, res) => {
  const { id } = req.params;

  locationModel.getById(id, (err, place) => {
    if (err) {
      console.error('❌ DB error loading place detail:', err);
      return res.sendStatus(500);
    }

    if (!place) {
      return res.status(404).json({
        success: false,
        error: req.__('Places.Error.notFound')
      });
    }

    // Add display_type with translation
    place.display_type = place.type === 'custom'
      ? place.custom_type
      : req.__('Places.Type.' + place.type);

    res.json({ success: true, place });
  });
};