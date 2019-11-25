const express = require("express");
const router = express.Router();


const PostCtrl = require('../controllers/post');

router.post('/post/add-post', PostCtrl.addPost);

module.exports = router;
