const express = require('express');
const router = express.Router();
const {getPost, createPost, updatePost, deletePost, toogleLikePost,getUserPosts,changeStatus} = require('../controllers/post');
const validate = require('../middleware/validate');

//get
router.get("/find/:id",validate,getPost);

router.get("/all/:userId",validate, getUserPosts);

//Implementing the timeline posts route
// router.get("/timeline/posts/:userId", (req, res) => {
//     res.send('Get timeline posts');
// });

//post
router.post("/create",validate, createPost); 

//put
router.put("/update/:id", validate, updatePost);

router.put("/toogleLike/:id", validate, toogleLikePost);

router.put("/changeStatus/:id", validate, changeStatus);

//delete
router.delete("/delete/:id",validate, deletePost);

module.exports = router;