const express = require("express");
const router = express.Router();
const multer = require("multer");
const { updateProfilePicture } = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

// PUT /users/profile-picture - update profile picture (protected)
router.put(
  "/profile-picture",
  authenticateToken,
  upload.single("image"),
  updateProfilePicture,
);

module.exports = router;
