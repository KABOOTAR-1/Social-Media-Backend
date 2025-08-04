const express = require('express');
const router = express.Router();

//Get
router.get("/:postId", (req, res) => {
    res.send(`Comments for post ID: ${req.params.postId}`);
});

router.get("/find/:commentId", (req, res) => {
    res.send(`Find comment with ID: ${req.params.commentId}`);
});

//Post
router.post("/create", (req, res) => {
    res.send('Create a new comment');
});

router.post("/reply/:commentId", (req, res) => {
    res.send(`Reply to comment with ID: ${req.params.commentId}`);
});

//Put
router.put("/update/:commentId", (req, res) => {
    res.send(`Update comment with ID: ${req.params.commentId}`);
});

router.put("/like/:commentId", (req, res) => {
    res.send(`Like comment with ID: ${req.params.commentId}`);
});

//Delete
router.delete("/delete/:commentId", (req, res) => {
    res.send(`Delete comment with ID: ${req.params.commentId}`);
}); 

module.exports = router;