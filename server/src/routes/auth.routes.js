import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { createToken } from "../utils/token.js";

const router = Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  const { firstName, lastName, age, email, username, password } = req.body;

  if (!firstName || !lastName || !age || !email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (Number(age) < 18) {
    return res.status(400).json({ message: "You must be at least 18 years old" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (existingUser) {
    return res.status(409).json({ message: "Email or username already exists" });
  }

  const userCount = await User.countDocuments();
  const user = await User.create({
    firstName,
    lastName,
    age: Number(age),
    email,
    username,
    passwordHash: hashPassword(password),
    role: userCount === 0 ? "admin" : "user"
  });

  const token = createToken({ userId: user._id.toString() });
  res.status(201).json({ token, user: user.toSafeJSON() });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = await User.findOne({ $or: [{ username }, { email: username.toLowerCase() }] });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  if (user.status === "blocked") {
    return res.status(403).json({ message: "Your account has been blocked" });
  }

  const token = createToken({ userId: user._id.toString() });
  res.json({ token, user: user.toSafeJSON() });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
