// app.js

const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const i18n = require('i18n');
const config = require('./config/config');
const db = require('./models/db');

const app = express();

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

// Static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/quill', express.static(path.join(__dirname, 'node_modules', 'quill', 'dist')));

// Parse POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Sessions with SQLite store
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite' }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));

// i18n configuration
i18n.configure({
  locales: ['en', 'bg'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  cookie: 'language',
  autoReload: true,
  updateFiles: false,
  syncFiles: false,
  objectNotation: true
});

// Initialize i18n
app.use(i18n.init);

// Set currentUser globally
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Load user preferences and set language
app.use((req, res, next) => {
  if (!req.session.user) return next();

  const userId = req.session.user.id;

  db.get('SELECT * FROM preferences WHERE user_id = ?', [userId], (err, prefs) => {
    if (err) {
      console.error('❌ Error loading preferences:', err);
      return next();
    }

    // Attach preferences to request and views
    req.userPrefs = prefs || {};
    res.locals.preferences = prefs || {};

    // Set locale only if available
    if (typeof req.setLocale === 'function' && prefs?.language) {
      req.setLocale(prefs.language);
    }

    // Make translation function available in views
    res.locals.__ = req.__.bind(req);

    next();
  });
});

// ---------------- ROUTES ----------------
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const draftRoutes = require('./routes/drafts');
const noteRoutes = require('./routes/notes');
const characterRoutes = require('./routes/characters');
const characterRelationshipsRoutes = require('./routes/characterRelationships');
const searchRoutes = require('./routes/search');
const settingsRoutes = require('./routes/settings');
const relationshipRoutes = require('./routes/relationships');
const partsRoutes = require('./routes/parts');
const placesRouter = require('./routes/places');
const eventsRouter = require('./routes/events');
const itemRoutes = require('./routes/items');

// Mount routes
app.use('/', authRoutes);
app.use('/projects', projectRoutes);
app.use('/drafts', draftRoutes);
app.use('/notes', noteRoutes);
app.use('/characters', characterRoutes);
app.use('/relationships', characterRelationshipsRoutes);
app.use('/search', searchRoutes);
app.use('/settings', settingsRoutes);
app.use('/relationships', relationshipRoutes);
app.use('/parts', partsRoutes);
app.use('/places', placesRouter);
app.use('/events', eventsRouter);
app.use('/items', itemRoutes);

// Home route
app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.redirect('/projects');
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`✍ Inkarus running at http://localhost:${PORT}`);
});
