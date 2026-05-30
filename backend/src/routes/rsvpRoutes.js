// Handles endpoints for RSVP operations
const express = require("express");
const router = express.Router();
const {
  rsvpEvent,
  cancelRSVP,
  getUserRSVPs,
} = require("../controllers/rsvpController");
const authenticateToken = require("../middleware/authMiddleware");

// GET — get all events the user has RSVPed to
router.get("/", authenticateToken, getUserRSVPs);

// POST — RSVP to an event
router.post("/:eventId", authenticateToken, rsvpEvent);

// DELETE — cancel RSVP
router.delete("/:eventId", authenticateToken, cancelRSVP);

module.exports = router;
