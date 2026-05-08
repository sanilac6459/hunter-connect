const express = require("express");
const router = express.Router();
const {
  joinGroup,
  leaveGroup,
  getUserGroups,
} = require("../controllers/membershipController");
const authenticateToken = require("../middleware/authMiddleware");

// GET /memberships - get all groups the logged in user is a member of
router.get("/", authenticateToken, getUserGroups);

// POST /memberships/join/:groupId - join a group
router.post("/join/:groupId", authenticateToken, joinGroup);

// DELETE /memberships/leave/:groupId - leave a group
router.delete("/leave/:groupId", authenticateToken, leaveGroup);

module.exports = router;
