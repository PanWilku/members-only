// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('../db/pool');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const { rows } = await pool.query(
            `SELECT id, email, password_hash, first_name, last_name
               FROM users
              WHERE email = $1`,
            [email]
          );
          const user = rows[0];
          if (!user) return done(null, false, { message: 'Invalid email or password' });

          const ok = await bcrypt.compare(password, user.password_hash);
          if (!ok) return done(null, false, { message: 'Invalid email or password' });
          
          return done(null, {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
          });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    // Store only the user id in the session row (connect.sid -> session row -> { passport: { user: id } })
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, email, first_name, last_name
           FROM users
          WHERE id = $1`,
        [id]
      );
      done(null, rows[0] || null);
    } catch (err) {
      done(err);
    }
  });
};