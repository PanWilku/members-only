const { Router } = require('express');
const router = Router();
const db = require('../db/pool');



router.get('/', async (req, res, next) => {

    try {
        const { rows: clubs } = await db.query('SELECT clubs.id, name, description, first_name FROM clubs INNER JOIN users ON clubs.owner_id = users.id ORDER BY name ASC');
        res.render('dashboard', { user: req.user, clubs });
    } catch (error) {
        next(error);
    }
})


module.exports = {
    dashboardRouter: router
}