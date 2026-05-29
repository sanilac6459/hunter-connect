// handles endpoints for user profile updates and account deletion

const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  updateProfilePicture,
  removeProfilePicture,
  updateProfile,
  deleteAccount,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

// configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// PUT - update profile (name + email)
router.put("/profile", authenticateToken, updateProfile);

// PUT - update profile picture
router.put(
  "/profile-picture",
  authenticateToken,
  upload.single("image"),
  updateProfilePicture,
);

// DELETE - remove profile picture
router.delete("/profile-picture", authenticateToken, removeProfilePicture);

// DELETE - delete account
router.delete("/account", authenticateToken, deleteAccount);

module.exports = router;
