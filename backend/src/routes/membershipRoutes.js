// handles endpoints for joining and leaving clubs

const express = require("express");
const router = express.Router();
const {
  joinGroup,
  leaveGroup,
  getUserGroups,
} = require("../controllers/membershipController");
const authenticateToken = require("../middleware/authMiddleware");

// GET - get all clubs the logged in user is a member of
router.get("/", authenticateToken, getUserGroups);

// POST - join a club
router.post("/join/:groupId", authenticateToken, joinGroup);

// DELETE - leave a club
router.delete("/leave/:groupId", authenticateToken, leaveGroup);

module.exports = router;
