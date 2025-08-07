const express = require('express');
const router = express.Router();
const validate= require('../middleware/validate');
const {
    getuser,
    userFollowers,
    userFollowing,
    updateUser,
    deleteUser,
    toggleFollow
} = require('../controllers/user');

router.get('/:id',validate, getuser);

router.get('/find/followers/:id',validate, userFollowers);

router.get('/find/following/:id',validate, userFollowing);

router.put('/update',validate, updateUser);

router.post('/toggleConnection/:username',validate, toggleFollow);

router.delete('/delete/:id',validate, deleteUser);

module.exports = router;