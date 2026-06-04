import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";
import { AnalysisResult } from "../models/AnalysisResult.js";
import { User } from "../models/User.js";
import { Video } from "../models/Video.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  res.json({ users });
});

router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: user.toSafeJSON() });
});

router.patch("/users/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!["active", "blocked"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: user.toSafeJSON() });
});

router.delete("/users/:id", async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot delete your own account" });
  }
  const videoIds = (await Video.find({ userId: req.params.id }, "_id").lean()).map((v) => v._id);
  await AnalysisResult.deleteMany({ videoId: { $in: videoIds } });
  await Video.deleteMany({ userId: req.params.id });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

router.get("/users/:id/videos", async (req, res) => {
  const videos = await Video.find({ userId: req.params.id }).sort({ createdAt: -1 }).lean();
  const videoIds = videos.map((v) => v._id);
  const results = await AnalysisResult.find({ videoId: { $in: videoIds } }).lean();
  const resultsByVideoId = new Map(results.map((r) => [r.videoId.toString(), r]));
  res.json({
    videos: videos.map((v) => ({ ...v, result: resultsByVideoId.get(v._id.toString()) || null }))
  });
});

export default router;
