const express = require('express');
const router = express.Router();

//Get
router.get("/:id", (req, res) => {
    res.send(`User profile for ID: ${req.params.id}`);
});

router.get("/find/all" ,( req, res) => {
    res.send("Get all users");
});

router.get("/find/:id", (req, res) => {
    res.send(`Followers of user ID: ${req.params.id}`);
});

//Put
router.put("/update/:id", (req, res) => {
    res.send(`Update user profile for ID: ${req.params.id}`);
});

router.post("/toogleConnection", (req, res) => {
    res.send(`Toggle connection for user ID: ${req}`);
});

//Delete
router.delete("/delete/:id", (req, res) => {
    res.send(`Delete user profile for ID: ${req.params.id}`);
});

module.exports = router; 
