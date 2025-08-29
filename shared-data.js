import express from "express";
import {
  addUser,
  getUserByUsername,
  createSession
} from "../shared-data.js";

const router = express.Router();

// Register
router.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const existingUser = getUserByUsername(username);
  if (existingUser) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const newUser = addUser({
    username:"sakshi",
    password:"sakshi123@",   // ⚠️ in real apps, hash this
    role: "user",
    createdBy: "self"
  });

  res.status(201).json({ message: "User registered successfully", user: newUser });
});

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = getUserByUsername(username);
  if (!user ) {
    return res.status(401).json({ error: "Invalid UserName" });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: "Invalid Password" });
  }

  const sessionId = createSession(user);
  res.json({ message: "Login successful", sessionId, user });
});

// Logout
router.post("/logout", (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID required" });
  }

  // Remove from sessions map
  import("../shared-data.js").then(({ sessions }) => {
    sessions.delete(sessionId);
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
