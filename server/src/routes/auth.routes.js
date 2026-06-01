import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { createToken } from "../utils/token.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  if (!firstName || !lastName || !email || !username || !password) {
    return res.status(400).json({ message: "All registration fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must contain at least 6 characters" });
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }]
  });

  if (existingUser) {
    return res.status(409).json({ message: "Email or username already exists" });
  }

  const userCount = await User.countDocuments();
  const user = await User.create({
    firstName,
    lastName,
    email,
    username,
    passwordHash: hashPassword(password),
    role: userCount === 0 ? "admin" : "user"
  });

  const token = createToken({ userId: user._id.toString(), role: user.role });

  res.status(201).json({ token, user: user.toSafeJSON() });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = await User.findOne({
    $or: [{ username }, { email: username.toLowerCase() }]
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  if (user.status !== "active") {
    return res.status(403).json({ message: "Your account has been blocked. Please contact the system administrator." });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = createToken({ userId: user._id.toString(), role: user.role });

  res.json({ token, user: user.toSafeJSON() });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
