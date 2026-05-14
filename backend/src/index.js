const express = require("express");
const cors = require("cors");
require("dotenv").config();

// import routes
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const postRoutes = require("./routes/postRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRoutes); // login/register
app.use("/groups", groupRoutes); // group CRUD
app.use("/posts", postRoutes); // post CRUD
app.use("/memberships", membershipRoutes); // join/leave clubs
app.use("/users", userRoutes); // user profile

// test route
app.get("/", (req, res) => {
  res.json({ message: "HunterConnect API is running!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
