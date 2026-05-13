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

// Store file in memory (buffer) instead of disk
const upload = multer({ storage: multer.memoryStorage() });

// GET /posts/group/:groupId - get all posts in a group (protected)
router.get("/group/:groupId", authenticateToken, getPostsByGroup);

// POST /posts/group/:groupId - create a post in a group (protected)
router.post(
  "/group/:groupId",
  authenticateToken,
  upload.single("image"),
  createPost,
);

// PUT /posts/:id - update a post (protected)
router.put("/:id", authenticateToken, upload.single("image"), updatePost);

// DELETE /posts/:id - delete a post (protected)
router.delete("/:id", authenticateToken, deletePost);

module.exports = router;
