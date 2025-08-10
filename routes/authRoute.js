// routes/authRoute.js
const express = require('express');
const router = express.Router();
const passport = require('passport');

// GET: login page
router.get('/log-in', (req, res) => {
  res.render('log-in', { error: null });
});

// POST: login with passport-local
router.post('/log-in', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).render('log-in', { error: info?.message || 'Login failed' });
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

// POST: logout (passport 0.6+ requires callback)
router.post('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

module.exports = { authRouter: router };
