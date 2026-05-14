// handles endpoints for user authentication

const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// POST — create a new user account
router.post("/register", register);

// POST — authenticate an existing user
router.post("/login", login);

module.exports = router;
