const bcrypt = require('bcrypt');
const db = require('../models/db');

// GET /login
exports.showLoginForm = (req, res) => {
  res.render('auth/login', { title: 'Login', error: null });
};

// POST /login
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.render('auth/login', { title: 'Login', error: 'Database error' });

    if (!user) {
      return res.render('auth/login', { title: 'Login', error: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('auth/login', { title: 'Login', error: 'Incorrect password' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    res.redirect('/projects');
  });
};

// GET /register
exports.showRegisterForm = (req, res) => {
  res.render('auth/register', { title: 'Register', error: null });
};

// POST /register
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const stmt = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

  db.run(stmt, [username, email, hashedPassword], function (err) {
    if (err) {
      const error = err.message.includes('UNIQUE') ? 'User or email already exists' : 'Registration error';
      return res.render('auth/register', { title: 'Register', error });
    }

    // Automatic login after registration
    req.session.user = {
      id: this.lastID,
      username,
      email
    };

    // Adding the default preferences
    db.run(`INSERT INTO preferences (user_id) VALUES (?)`, [this.lastID]);

    res.redirect('/projects');
  });
};

// GET /logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.log('Logout error:', err);
    res.redirect('/login');
  });
};
