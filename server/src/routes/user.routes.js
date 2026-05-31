import { Router } from "express";

import { authenticate, requireRole } from "../middleware/auth.middleware.js";
import { User } from "../models/User.js";

const router = Router();

router.get("/", authenticate, requireRole("admin"), async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map((user) => user.toSafeJSON()) });
});

router.patch("/:id/role", authenticate, requireRole("admin"), async (req, res) => {
  const { role } = req.body;

  if (!["admin", "operator", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: user.toSafeJSON() });
});

router.patch("/:id/status", authenticate, requireRole("admin"), async (req, res) => {
  const { status } = req.body;

  if (!["active", "disabled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: user.toSafeJSON() });
});

export default router;
