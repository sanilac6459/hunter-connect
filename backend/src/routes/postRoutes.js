// handles endpoints for post CRUD operations

const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getPostsByGroup,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const authenticateToken = require("../middleware/authMiddleware");

// configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// GET - get all posts in a group by id
router.get("/group/:groupId", authenticateToken, getPostsByGroup);

// POST - create a post in a group
router.post(
  "/group/:groupId",
  authenticateToken,
  upload.single("image"),
  createPost,
);

// PUT - update a post
router.put("/:id", authenticateToken, upload.single("image"), updatePost);

// DELETE - delete a post
router.delete("/:id", authenticateToken, deletePost);

module.exports = router;
