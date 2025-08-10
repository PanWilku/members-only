const { Router } = require('express');
const { handleCreateClub } = require('../utils/handleCreateClub');


const router = Router();



router.get('/', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/log-in');
    }
    res.render('create-club', { user: req.user });
});


router.get('/own', (req, res) => {
    console.log('Accessing create-club-own route');
    if (!req.isAuthenticated()) {
        return res.redirect('/log-in');
    }
    res.render('create-club-own', { user: req.user, errors: []});
});


router.post('/own', handleCreateClub, (req, res) => {
    console.log('Accessing create-club-own route');
    if (!req.isAuthenticated()) {
        res.render('log-in', { error: 'You must be logged in to create a club.' });
        return;
    }
    res.render('create-club-own', { user: req.user });
});

module.exports = { createClubRouter: router };