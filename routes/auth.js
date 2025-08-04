const express=require('express');
const router=express.Router();

//post routes for authentication
router.post('/login', (req, res) => {
    res.send('Login route');
});

router.post('/register', (req, res) => {
    res.send('Register route');
});

router.post('/logout', (req, res) => {
    res.send('Logout route');
});

router.post('updateProfile', (req, res) => {
    res.send('Update profile route');
});

module.exports = router;