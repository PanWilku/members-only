const  { body } = require('express-validator');
const db = require('../db/pool');




const signUpValidation = [

    body('first_name').trim().escape()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 40 }).withMessage('First name must be between 2 and 40 characters long'),


    body('last_name').trim().escape()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 40 }).withMessage('Last name must be between 2 and 40 characters long'),

    body('email').trim().escape()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email is not valid')
        .custom( async (email) => {
            const result = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
            if (result.rows.length > 0) {
                throw new Error('Email is already registered!');
            }
            return true;
        }),
    
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),

    body('confirmPassword').custom(( password, { req }) => {
        if (password !== req.body.password) {
            throw new Error('Passwords doesnt match!');
        }
        return true;
    })

];


module.exports = { signUpValidation };