// routes/indexRoute.js
const { Router } = require('express');
const db = require('../db/pool');

const router = Router();

router.get('/', async (req, res) => {
  const randomMessagesQuery = `
    SELECT
      m.message AS message,
      u.first_name AS name
    FROM club_topic_messages m
    JOIN users u ON m.author_id = u.id
    ORDER BY RANDOM()
    LIMIT 5;
  `;

  try {
    const { rows } = await db.query(randomMessagesQuery);

    // Always pass randomMessages (even if empty)
    res.render('index', {
      title: 'Club Hub',
      randomMessages: rows ?? [],
      error: null
    });
  } catch (err) {
    console.error('Error fetching random messages:', err);
    // Still pass an empty array so EJS never sees an undefined var
    res.render('index', {
      title: 'Club Hub',
      randomMessages: [],
      error: 'Failed to load messages.'
    });
  }
});

module.exports = { indexRouter: router };
