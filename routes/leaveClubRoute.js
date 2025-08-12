const { Router } = require('express');
const db = require('../db/pool');

const router = Router();



router.post('/:id', async (req, res, next) => {
    const clubId = req.params.id;
    const userId = req.user.id;

    try {
        // leave club by deleting the membership record
        const result = await db.query(
            'DELETE FROM club_memberships WHERE club_id = $1 AND user_id = $2',
            [clubId, userId]
        );
        res.redirect(`/club/${clubId}`);
    } catch (error) {
        console.error('Error leaving club:', error);
        res.status(500).render('error', { message: 'Failed to leave the club.' });
    }
});

module.exports = {
    leaveClubRouter: router
};