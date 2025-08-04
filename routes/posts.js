const express = require('express');
const router = express.Router();

//get
router.get("/find/:userId", (req, res) => {
    res.send(`Posts for user ID: ${req.params.userId}`);
});

router.get("/find/:id", (req, res) => {
    res.send(`Find post with ID: ${req.params.id}`);
});

router.get("/timeline/posts/:userId", (req, res) => {
    res.send('Get timeline posts');
});

//post
router.post("/create", (req, res) => {
    res.send('Create a new post');
}); 

//put
router.put("/update/:id", (req, res) => {
    res.send(`Update post with ID: ${req.params.id}`);
});

router.put("/toohleLike/:id", (req, res) => {
    res.send(`Like post with ID: ${req.params.id}`);
});

//delete
router.delete("/delete/:id", (req, res) => {
    res.send(`Delete post with ID: ${req.params.id}`);
});

module.exports = router;