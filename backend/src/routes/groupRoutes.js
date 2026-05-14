// handles endpoints for group CRUD operations

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

// configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// GET - get all groups
router.get("/", getAllGroups);

// GET - get a single group by id
router.get("/:id", getGroupById);

// POST - create a group
router.post("/", authenticateToken, upload.single("image"), createGroup);

// PUT - update a group
router.put("/:id", authenticateToken, upload.single("image"), updateGroup);

// DELETE - delete a group
router.delete("/:id", authenticateToken, deleteGroup);

module.exports = router;
