const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} = require("../controllers/groupController");
const authenticateToken = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

// GET /groups - get all groups (public)
router.get("/", getAllGroups);

// GET /groups/:id - get a single group
router.get("/:id", getGroupById);

// POST /groups - create a group (protected)
router.post("/", authenticateToken, upload.single("image"), createGroup);

// PUT /groups/:id - update a group (protected)
router.put("/:id", authenticateToken, upload.single("image"), updateGroup);

// DELETE /groups/:id - delete a group (protected)
router.delete("/:id", authenticateToken, deleteGroup);

module.exports = router;
