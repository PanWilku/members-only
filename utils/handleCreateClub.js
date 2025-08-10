const bcrypt = require('bcrypt');
const db = require('../db/pool');
const  { body, validationResult } = require('express-validator');



const validation = [
    
    body('clubName').trim().notEmpty().withMessage('Club name is required.'),
    body('clubDescription').trim().notEmpty().withMessage('Club description is required.'),
    body('passcode').notEmpty().withMessage('Passcode is required.').isLength({ min: 6, max: 24 }).withMessage('Passcode must be at least 6 characters long. Up to 24.'),
];


const handleCreateClub = async (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.render('log-in', { error: 'You must be logged in to create a club.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('create-club-own', {
            user: req.user,
            errors: errors.array()
        });
    }
    const { clubName, clubDescription, passcode } = req.body;

    const hashedPasscode = bcrypt.hashSync(passcode, 10);

    await db.query('CREATE TABLE IF NOT EXISTS clubs (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, passcode TEXT NOT NULL, owner_id INTEGER REFERENCES users(id))');

    await db.query('INSERT INTO clubs (name, description, passcode, owner_id) VALUES ($1, $2, $3, $4)', [clubName, clubDescription, hashedPasscode, req.user.id]);

    res.redirect('/dashboard');
}


module.exports = { handleCreateClub };