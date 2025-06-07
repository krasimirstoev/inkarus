const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const app = express();

// Initialize DB
require('./models/db');
// Configuration
const config = require('./config/config');

// Route imports
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

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Serve Quill assets from node_modules
app.use('/quill', express.static(path.join(__dirname, 'node_modules', 'quill', 'dist')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(methodOverride('_method'));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite' }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));

// Global user middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
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

// Home
app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.redirect('/projects');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

// Server start
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`✍ Inkarus running at http://localhost:${PORT}`);
});
