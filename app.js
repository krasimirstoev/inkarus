// app.js

const express            = require('express');
const session            = require('express-session');
const SQLiteStore        = require('connect-sqlite3')(session);
const methodOverride     = require('method-override');
const bodyParser         = require('body-parser');
const path               = require('path');
const expressLayouts     = require('express-ejs-layouts');
const i18n               = require('i18n');
const config             = require('./config/config');
const db                 = require('./models/db');

const app = express();

// 1) EJS view engine + layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

// 2) Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/quill', express.static(path.join(__dirname, 'node_modules/quill/dist')));

// 3) Parse POST bodies & method override
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// 4) Session (SQLite store)
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite' }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));

// 5) i18n configuration
i18n.configure({
  locales:        ['en', 'bg'],
  directory:      path.join(__dirname, 'locales'),
  defaultLocale:  'en',
  queryParameter: 'lang',
  cookie:         'language',
  autoReload:     true,
  updateFiles:    false,
  syncFiles:      false,
  objectNotation: true
});

// 6) Initialize i18n (adds req.__, req.getLocale, req.setLocale, etc.)
app.use(i18n.init);

// 7) Make translation helper available in all views
app.use((req, res, next) => {
  res.locals.__ = req.__.bind(req);
  next();
});

// 8) Make currentUser available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// 9) Load user preferences (including preferred language) and apply locale
app.use((req, res, next) => {
  if (!req.session.user) {
    // no user → keep default or query param locale
    return next();
  }

  const userId = req.session.user.id;
  db.get(
    'SELECT * FROM preferences WHERE user_id = ?',
    [userId],
    (err, prefs) => {
      if (err) {
        console.error('❌ Error loading preferences:', err);
        return next();
      }

      // Attach prefs to req and views
      req.userPrefs         = prefs || {};
      res.locals.preferences = prefs || {};

      // If user has a saved language, switch locale
      if (prefs?.language && typeof req.setLocale === 'function') {
        req.setLocale(prefs.language);
        res.locals.__ = req.__.bind(req);
      }

      next();
    }
  );
});

// 10) Inject full translations catalog into views, _after_ locale is set
app.use((req, res, next) => {
  res.locals.translations = i18n.getCatalog(req.getLocale());
  next();
});

// ---------------- ROUTES ----------------
const authRoutes                     = require('./routes/auth');
const projectRoutes                  = require('./routes/projects');
const draftRoutes                    = require('./routes/drafts');
const noteRoutes                     = require('./routes/notes');
const characterRoutes                = require('./routes/characters');
const characterRelationshipsRoutes   = require('./routes/characterRelationships');
const searchRoutes                   = require('./routes/search');
const settingsRoutes                 = require('./routes/settings');
const relationshipRoutes             = require('./routes/relationships');
const partsRoutes                    = require('./routes/parts');
const placesRouter                   = require('./routes/places');
const eventsRouter                   = require('./routes/events');
const itemRoutes                     = require('./routes/items');

// Mount
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

// Home redirect
app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.redirect('/projects');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: req.__('NotFoundPage.message') });
});

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`✍ Inkarus running at http://localhost:${PORT}`);
});
