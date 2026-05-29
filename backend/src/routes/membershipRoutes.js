// handles endpoints for joining and leaving clubs

// Handles endpoints for joining and leaving groups
const express = require("express");
const router = express.Router();
const {
  joinGroup,
  leaveGroup,
  getUserGroups,
  updateMemberRole,
} = require("../controllers/membershipController");
const authenticateToken = require("../middleware/authMiddleware");

// GET — get all groups the logged in user is a member of
router.get("/", authenticateToken, getUserGroups);

// POST — join a group
router.post("/join/:groupId", authenticateToken, joinGroup);

// DELETE — leave a group
router.delete("/leave/:groupId", authenticateToken, leaveGroup);

// PUT — promote or demote a member (admin only)
router.put("/:groupId/role/:userId", authenticateToken, updateMemberRole);

module.exports = router;
