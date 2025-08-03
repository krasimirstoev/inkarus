// controllers/eventController.js - Controller for handling event-related actions

const eventModel = require('../models/eventModel');

/**
 * Render the timeline page with both the SVG‐timeline and the list below.
 */
exports.view = (req, res) => {
  const { projectId } = req.params;
  // Pull all events for this project
  eventModel.getAll(projectId, (err, events) => {
    if (err) {
      console.error('❌ DB error loading events:', err);
      return res.sendStatus(500);
    }
    // Render and pass `events` into the template
    res.render('events/list', {
      title: req.__('Events.Page.title'),
      projectId,
      events
    });
  });
};

/**
 * Return JSON list of events for frontend timeline.
 */
exports.jsonList = (req, res) => {
  const { projectId } = req.params;
  eventModel.getAll(projectId, (err, events) => {
    if (err) {
      console.error('❌ Error fetching events list:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, events });
  });
};

/**
 * Return JSON detail for a single event.
 */
exports.jsonDetail = (req, res) => {
  const { id } = req.params;
  eventModel.getById(id, (err, event) => {
    if (err) {
      console.error('❌ Error fetching event detail:', err);
      return res.status(500).json({ success: false });
    }
    if (!event) {
      return res.status(404).json({ success: false });
    }
    res.json({ success: true, event });
  });
};

/**
 * Handle new/edit form modal rendering.
 */
exports.form = (req, res) => {
  const { projectId, id } = req.params;
  const data = { projectId, id };
  if (id) {
    // edit
    eventModel.getById(id, (err, event) => {
      if (err || !event) return res.sendStatus(404);
      data.event = event;
      return res.render('events/form-modal', { ...data, layout: false });
    });
  } else {
    // new
    data.event = { title:'', description:'', event_date:'', is_abstract:1, display_order:0 };
    res.render('events/form-modal', { ...data, layout: false });
  }
};

/**
 * Create or update action.
 */
exports.submit = (req, res) => {
  const { projectId, id } = req.params;
  const { title, description, event_date, is_abstract, display_order } = req.body;
  const abstractFlag = is_abstract === 'on';
  const order = parseInt(display_order, 10) || 0;

  if (id) {
    eventModel.update(
      id, title, description, event_date || null, abstractFlag, order,
      err => {
        if (err) {
          console.error('❌ Error updating event:', err);
          return res.status(500).json({ success: false });
        }
        res.json({ success: true });
      }
    );
  } else {
    eventModel.create(
      projectId, title, description, event_date || null, abstractFlag, order,
      (err, result) => {
        if (err) {
          console.error('❌ Error creating event:', err);
          return res.status(500).json({ success: false });
        }
        res.json({ success: true, id: result.id });
      }
    );
  }
};

/**
 * Delete an event.
 */
exports.delete = (req, res) => {
  const { id } = req.params;
  eventModel.delete(id, err => {
    if (err) {
      console.error('❌ Error deleting event:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
};