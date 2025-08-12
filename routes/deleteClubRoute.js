const { Router } = require('express');
const db = require('../db/pool');


const router = Router();


router.post('/:id', async (req, res, next) => {
    const clubId = req.params.id;
    const userId = req.user.id;

    try {
        // Delete the club from the database
        await db.query(
            'DELETE FROM clubs WHERE id = $1 AND owner_id = $2',
            [clubId, userId]
        );
        res.redirect('/dashboard');
    } catch (error) {
        next( new Error('Failed to delete the club.'));
    }
});

module.exports = {
    deleteClubRouter: router
};