const { Router } = require('express');
const db = require('../db/pool');
const normalizeText = require('../utils/normalizeText');


const router = Router();




router.get('/:id/create-topic', async (req, res, next) => {
  const clubId = Number(req.params.id); // basic guard
  if (!Number.isInteger(clubId)) return res.status(400).send('Invalid club id');
    console.log('Accessing create-topic route for club ID:', clubId);
  try {
    const { rows } = await db.query(
      'SELECT * FROM clubs WHERE id = $1',
      [clubId]
    );

    const club = rows[0];
    if (!club) return res.status(404).send('Club not found');

    res.render('create-topic', { user: req.user, club, error: null });
  } catch (error) {
    next(error);
  }
});






router.post('/:id/create-topic', async (req, res, next) => {
  const clubId = Number(req.params.id); // basic guard
  if (!Number.isInteger(clubId)) return res.status(400).send('Invalid club id');
    if (!req.isAuthenticated()) {
        return res.status(401).send('You must be logged in to create a topic.');
    }

    const userId = req.user.id;
    let { title, message } = req.body;

    if (!title || !message) {
        return res.status(400).send('Title and message are required.');
    }

    title = normalizeText(title);
    message = normalizeText(message);
    // add to topic database

    try {
        const { rows } = await db.query('INSERT INTO club_topics (club_id, title, author_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id', [clubId, title, userId]);
        const topicId = rows[0].id;

        await db.query('INSERT INTO club_topic_messages (topic_id, author_id, message, created_at) VALUES ($1, $2, $3, NOW())', [topicId, userId, message]);

        res.redirect(`/topic/${clubId}/${topicId}`);

    } catch (error) {
        next(new Error('Error creating topic: ' + error.message));    
    }

});



module.exports = { createTopicRouter: router };