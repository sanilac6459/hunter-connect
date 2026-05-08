const express = require("express");
const router = express.Router();
const {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} = require("../controllers/groupController");
const authenticateToken = require("../middleware/authMiddleware");

// GET /groups - get all groups (public)
router.get("/", getAllGroups);

// GET /groups/:id - get a single group
router.get("/:id", getGroupById);

// POST /groups - create a group (protected)
router.post("/", authenticateToken, createGroup);

// PUT /groups/:id - update a group (protected)
router.put("/:id", authenticateToken, updateGroup);

// DELETE /groups/:id - delete a group (protected)
router.delete("/:id", authenticateToken, deleteGroup);

module.exports = router;
