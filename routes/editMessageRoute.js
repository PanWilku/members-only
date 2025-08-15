const { Router } = require('express');
const db = require('../db/pool');
const normalizeText = require('../utils/normalizeText');



const router = Router();




router.get('/:id/:topicId/edit/:messageId', async (req, res, next) => {
  const clubId = Number(req.params.id); // basic guard
  const topicId = Number(req.params.topicId);
  const messageId = Number(req.params.messageId);
  if (!Number.isInteger(clubId)) return res.status(400).send('Invalid club id');
    console.log('Accessing create-topic route for club ID:', clubId);
  try {
       const { rows } = await db.query(
     'SELECT club_topic_messages.id, club_topic_messages.topic_id, club_topic_messages.author_id, club_topic_messages.message, club_topic_messages.created_at, club_topic_messages.updated_at, users.id AS user_id, users.first_name AS name FROM club_topic_messages JOIN users ON club_topic_messages.author_id = users.id WHERE club_topic_messages.topic_id = $1 ORDER BY club_topic_messages.created_at ASC',
     [topicId]
   );
    let messages = rows;

    for (const message of messages) {
        // add canEdit property to each message
        message.canEdit = message.author_id === req.user.id;
    }
    

    const { rows: topicRows } = await db.query('SELECT title FROM club_topics WHERE id = $1', [topicId]);
    // get all messages for the topic
    const topicName = topicRows[0]?.title;

    const isMember = await db.query( //check if user is a member of the club
        'SELECT 1 FROM club_memberships WHERE club_id = $1 AND user_id = $2',
        [clubId, req.user.id]
    );
    const is_member = isMember.rowCount > 0;

    res.render('edit-message', { user: req.user, clubId, topicId, messages, topicName, error: null, is_member, messageId});
  } catch (error) {
    next(error);
  }
});




router.post('/:id/:topicId/edit/:messageId/submit', async (req, res, next) => {
    const clubId = Number(req.params.id);
    const topicId = Number(req.params.topicId);
    const messageId = Number(req.params.messageId);

    if (!req.isAuthenticated()) {
        return res.status(401).send('You must be logged in to edit a message.');
    }

    const userId = req.user.id;
    let { message } = req.body;

    if (!message) {
        return res.status(400).send('Message is required.');
    }

    message = normalizeText(message);

    try {
        await db.query('UPDATE club_topic_messages SET message = $1, updated_at = NOW() WHERE id = $2 AND author_id = $3', [message, messageId, userId]);
        res.redirect(`/topic/${clubId}/${topicId}`);
    } catch (error) {
        next(error);
    }


});

module.exports = { editMessageRouter: router };


