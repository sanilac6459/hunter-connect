// handles endpoints for user profile updates

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { updateProfilePicture } = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

// configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// PUT - update profile picture (protected)
router.put(
  "/profile-picture",
  authenticateToken,
  upload.single("image"),
  updateProfilePicture,
);

module.exports = router;
