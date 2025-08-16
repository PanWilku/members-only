const { Router } = require('express');
const db = require('../db/pool');
const normalizeText = require('../utils/normalizeText');



const router = Router();




router.post('/:id/:topicId/delete/:messageId', async (req, res, next) => {
    //check if user is an author of a message or an admin of a club, then delete the message
    const clubId = Number(req.params.id);
    const topicId = Number(req.params.topicId);
    const messageId = Number(req.params.messageId);
    if (!req.isAuthenticated()) {
        return res.status(401).send('You must be logged in to delete a message.');
    }
    const userId = req.user.id;

    try {
        // check if user is the author of the message
        const { rows: messageRows } = await db.query(
            'SELECT author_id FROM club_topic_messages WHERE id = $1 AND topic_id = $2',
            [messageId, topicId]
        );
        if (messageRows.length === 0) {
            return res.status(404).send('Message not found');
        }
        const messageAuthorId = messageRows[0].author_id;

        if (messageAuthorId !== userId) {
            // Check if user is an admin of the club
            const { rows: adminRows } = await db.query(
                'SELECT user_id FROM club_memberships WHERE user_id = $1 AND club_id = $2 AND role = $3',
                [userId, clubId, 'owner']
            );
            if (adminRows.length === 0) {
                return res.status(403).send('You are not authorized to delete this message');
            }
        }

        // If we reach this point, the user is either the author or an admin
        await db.query(
            'DELETE FROM club_topic_messages WHERE id = $1 AND topic_id = $2',
            [messageId, topicId]
        );
        res.redirect(`/topic/${clubId}/${topicId}`);

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).send('Internal server error');
    }
});


router.post('/:id/:topicId/delete/', async (req, res, next) => {
    //delete topic from club_topics
    const clubId = Number(req.params.id);
    const topicId = Number(req.params.topicId);
    if (!req.isAuthenticated()) {
        return res.status(401).send('You must be logged in to delete a topic.');
    }
    const userId = req.user.id;

    try {
        // Check if user is the author of the topic
        const { rows: topicRows } = await db.query(
            'SELECT author_id FROM club_topics WHERE id = $1',
            [topicId]
        );
        if (topicRows.length === 0) {
            return res.status(404).send('Topic not found');
        }
        const topicAuthorId = topicRows[0].author_id;

        if (topicAuthorId !== userId) {
            // Check if user is an admin of the club
            const { rows: adminRows } = await db.query(
                'SELECT user_id FROM club_memberships WHERE user_id = $1 AND club_id = $2 AND role = $3',
                [userId, clubId, 'owner']
            );
            if (adminRows.length === 0) {
                return res.status(403).send('You are not authorized to delete this topic');
            }
        }

        // If we reach this point, the user is either the author or an admin
        await db.query(
            'DELETE FROM club_topics WHERE id = $1',
            [topicId]
        );
        res.redirect(`/club/${clubId}`);
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).send('Internal server error');
    }
});


module.exports = {
    deleteMessageRouter: router
};