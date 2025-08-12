const { Router } = require('express');
const db = require('../db/pool');
const bcrypt = require('bcrypt');

const router = Router();



router.post('/code', async (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.render('log-in', { error: 'You must be logged in to join a club.' });
    }

    try {
        const passcode = req.body.passcode;
        let clubsMatchingPasscode = [];
        const { rows: clubs } = await db.query('SELECT * FROM clubs');
        for (const club of clubs) {
        const match = await bcrypt.compare(passcode, club.passcode); //compare hashed passcode with the club's passcode
        // If the passcode matches, add the club to the list
        // of clubs that the user can join
        if (match) {
            clubsMatchingPasscode.push({id: club.id, name: club.name });
        }
        }
        if (clubsMatchingPasscode.length === 0) {
            return res.render('create-club', { error: 'Invalid passcode. Please try again.', user: req.user });
        } else if (clubsMatchingPasscode.length > 0) {
            let failedJoins = 0;
            for (const club of clubsMatchingPasscode) {
                // Check if the user is already a member
                const { rowCount } = await db.query(
                    'SELECT 1 FROM club_memberships WHERE club_id = $1 AND user_id = $2',
                    [club.id, req.user.id]
                );

                if (rowCount === 0) {
                    // If not a member, insert into club_memberships
                    await db.query(
                        'INSERT INTO club_memberships (club_id, user_id, role, joined_at) VALUES ($1, $2, $3, NOW())',
                        [club.id, req.user.id, 'member']
                    );
                } else {
                    failedJoins++;
                }
            }
            if (failedJoins > 0) { //render error if user is already a member of some clubs
                return res.render('create-club', { error: `You are already a member of ${failedJoins} club(s). Joined other clubs with the entered passcode if exist.`, user: req.user });
            }
            return res.redirect('/dashboard'); // Redirect to dashboard after successful join to some clubs
        }

    } catch (error) {
        next(new Error('Failed to join the club. Please try again.'));
    }
});





router.post('/:id', async (req, res, next) => {
    console.log('Accessing join-club route');
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

    const { passcode } = req.body;
    const { rows: passcodeRow } = await db.query(
      'SELECT passcode FROM clubs WHERE id = $1',
      [clubId]
    );
    //compare hasedpasscode with the club's passcode
    bcrypt.compare(passcode, passcodeRow[0].passcode, async (err, result) => {
      if (err) {
        return res.render('club-view', { user: req.user, club, error: 'Invalid passcode.' });
      }});

      //add a user to the club_memberships table
    await db.query(
        'INSERT INTO club_memberships (club_id, user_id) VALUES ($1, $2)',
        [clubId, req.user.id]
      );

    const isMember = await db.query(
      'SELECT 1 FROM club_memberships WHERE club_id = $1 AND user_id = $2',
      [clubId, req.user.id]
    );
    club.is_member = isMember.rowCount > 0; // adds is_member property to club object


    res.redirect(`/club/${clubId}`);
    } catch (error) {
    next(error);
  }
   
});








module.exports = {
    joinClubRouter: router
};