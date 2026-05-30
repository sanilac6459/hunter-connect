// handles endpoints for event CRUD operations

const express = require("express");
const router = express.Router();
const {
  getEventsByGroup,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const authenticateToken = require("../middleware/authMiddleware");

// GET — get all events in a group (protected)
router.get("/group/:groupId", authenticateToken, getEventsByGroup);

// POST — create an event in a group (protected)
router.post("/group/:groupId", authenticateToken, createEvent);

// PUT — update an event (protected)
router.put("/:id", authenticateToken, updateEvent);

// DELETE — delete an event (protected)
router.delete("/:id", authenticateToken, deleteEvent);

module.exports = router;
