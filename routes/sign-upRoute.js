const { Router } = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const db = require('../db/pool'); // your pg Pool
const { signUpValidation } = require('../utils/signUpValidation')
const { validationResult } = require('express-validator');

router.get('/', (req, res) => {

  res.render('sign-up', { errors: [], old: {} });

});

router.post('/', signUpValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('sign-up', { errors: errors.array(), old: req.body });
    }

    const { first_name, last_name, email, password } = req.body;

    try {

        const hashedPassword = bcrypt.hashSync(password, 10);
        await db.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, membership_status, is_admin, created_at) 
            VALUES ($1, $2, $3, $4, 'member', false, NOW())`,
            [first_name, last_name, email, hashedPassword]
        )
    } catch (error) {
        console.error('Error inserting user:', error);
        return res.render('sign-up', { errors: [{ msg: 'Error creating account' }], old: req.body });
    }


    res.redirect('/dashboard');
    


})

module.exports = { 
    signUpRouter: router
     };