const {Router} = require('express');
const db = require('../db/pool');
const router = Router();



router.get('/:id', async (req, res, next) => {
  const clubId = Number(req.params.id); // basic guard
  if (!Number.isInteger(clubId)) return res.status(400).send('Invalid club id');

  try {
    const { rows } = await db.query(
      `
      SELECT
        c.id,
        c.name,
        c.description,
        u.first_name AS owner_first_name,
        u.last_name  AS owner_last_name
      FROM clubs c
      JOIN users u ON u.id = c.owner_id
      WHERE c.id = $1
      LIMIT 1
      `,
      [clubId]
    );

    const club = rows[0];
    if (!club) next(new Error('Club not found'));


    //get number of messages from club_topics
    const { rows: topicCountRows } = await db.query(
      'SELECT id FROM club_topics WHERE club_id = $1', [clubId]
    );
    let totalMessages = 0;
    for(const topic of topicCountRows) {
      const { rows: messageCountRows } = await db.query(
        'SELECT COUNT(*) FROM club_topic_messages WHERE topic_id = $1', [topic.id]
      );
      totalMessages += Number(messageCountRows[0].count);
    }

    club.messages_count = totalMessages;




    //get number of members in the club
    const { rows: memberCountRows } = await db.query(
      'SELECT COUNT(*) FROM club_memberships WHERE club_id = $1', [clubId]
    );
    club.members_count = Number(memberCountRows[0].count);



    const isMember = await db.query(
      'SELECT 1 FROM club_memberships WHERE club_id = $1 AND user_id = $2',
      [clubId, req.user.id]
    );
    club.is_member = isMember.rowCount > 0; // adds is_member property to club object

    const { rows: isOwner } = await db.query(' SELECT first_name FROM clubs JOIN users ON users.id = clubs.owner_id WHERE clubs.id = $1 AND clubs.owner_id = $2', [clubId, req.user.id]);
    club.is_owner = isOwner.length > 0; // adds is_owner property to club object


    const { rows: ownerName } = await db.query(' SELECT users.first_name FROM clubs JOIN users ON users.id = clubs.owner_id WHERE users.id = clubs.owner_id');
    club.owner_name = ownerName.length > 0 ? ownerName[0].first_name : null; // adds owner_name property to club object

    const { rows: club_topicsData } = await db.query(
      'SELECT club_topics.id, title, users.first_name FROM club_topics JOIN users ON users.id = club_topics.author_id WHERE club_id = $1 ORDER BY club_topics.created_at DESC',
      [clubId]
    );
    let club_topics;
    if (club_topicsData.length === 0) {
        club_topics = null;
    } else {
        club_topics = club_topicsData;
    }

    res.render('club-view', { user: req.user, club, club_topics, error: null });
  } catch (error) {
    next(error);
  }
});






module.exports = {
    viewClubRouter: router
};