const { Router } = require('express');
const router = Router();



router.get('/dashboard', (req, res) => {
    res.render('dashboard', { user: req.user });
})


module.exports = {
    dashboardRouter: router
}