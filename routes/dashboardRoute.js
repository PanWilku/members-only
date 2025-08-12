const { Router } = require('express');
const router = Router();
const db = require('../db/pool');



router.get('/', async (req, res, next) => {

    try {
        const { rows: clubs } = await db.query('SELECT clubs.id, name, description, first_name FROM clubs INNER JOIN users ON clubs.owner_id = users.id ORDER BY name ASC');
        for (const club of clubs) {
            const isMember = await db.query(
                'SELECT club_id FROM club_memberships WHERE club_id = $1 AND user_id = $2',
                [club.id, req.user.id]
            );
            if (isMember.rowCount > 0) {
                club.is_member = true;
            } else {
                club.is_member = false;
            }
        }


        res.render('dashboard', { user: req.user, clubs });
    } catch (error) {
        next(error);
    }
})


module.exports = {
    dashboardRouter: router
}