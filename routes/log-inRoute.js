const { Router } = require('express');



const router = Router();



router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('log-in', { user: req.user, error: null });
});


module.exports = {
    logInRouter: router
};