import { Router } from "express";

import { authenticate, requireRole } from "../middleware/auth.middleware.js";
import { AnalysisResult } from "../models/AnalysisResult.js";
import { User } from "../models/User.js";
import { Video } from "../models/Video.js";

const router = Router();

router.get("/", authenticate, requireRole("admin"), async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map((user) => user.toSafeJSON()) });
});

router.patch("/:id/role", authenticate, requireRole("admin"), async (req, res) => {
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "Admins cannot change their own role" });
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

  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "Admins cannot block their own account" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: user.toSafeJSON() });
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "Admins cannot delete their own account" });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const userVideos = await Video.find({ userId: user._id }).select("_id");
  const videoIds = userVideos.map((video) => video._id);

  await AnalysisResult.deleteMany({ videoId: { $in: videoIds } });
  await Video.deleteMany({ userId: user._id });
  await User.deleteOne({ _id: user._id });

  res.json({ message: "User and related video analysis data deleted" });
});

export default router;
