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
    if (!club) return res.status(404).render('404', { user: req.user, message: 'Club not found' });

    res.render('club-view', { user: req.user, club });
  } catch (error) {
    next(error);
  }
});



module.exports = {
    viewClubRouter: router
};