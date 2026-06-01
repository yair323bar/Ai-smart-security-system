import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Router } from "express";
import multer from "multer";

import { authenticate, requireRole } from "../middleware/auth.middleware.js";
import { AnalysisResult } from "../models/AnalysisResult.js";
import { Video } from "../models/Video.js";
import { analyzeVideoWithAI } from "../services/ai.service.js";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed"));
    }

    cb(null, true);
  }
});

function canAccessVideo(user, video) {
  return user.role === "admin" || video.userId.toString() === user._id.toString();
}

router.post("/upload", authenticate, upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Video file is required" });
  }

  const video = await Video.create({
    userId: req.user._id,
    originalName: req.file.originalname,
    fileName: req.file.filename,
    path: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size
  });

  res.status(201).json({ video });
});

router.get("/", authenticate, async (req, res) => {
  const query = req.user.role === "admin" ? {} : { userId: req.user._id };
  const videos = await Video.find(query).sort({ createdAt: -1 });
  res.json({ videos });
});

router.post("/:id/analyze", authenticate, async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  if (!canAccessVideo(req.user, video)) {
    return res.status(403).json({ message: "Access denied for this video" });
  }

  video.status = "analyzing";
  video.errorMessage = null;
  await video.save();

  try {
    const analysis = await analyzeVideoWithAI(video.path);
    const result = await AnalysisResult.findOneAndUpdate(
      { videoId: video._id },
      {
        videoId: video._id,
        userId: video.userId,
        ...analysis
      },
      { new: true, upsert: true }
    );

    video.status = "completed";
    await video.save();

    res.json({ video, result });
  } catch (error) {
    video.status = "failed";
    video.errorMessage = error.message;
    await video.save();

    res.status(502).json({ message: "AI analysis failed", detail: error.message });
  }
});

router.get("/:id/result", authenticate, async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  if (!canAccessVideo(req.user, video)) {
    return res.status(403).json({ message: "Access denied for this video" });
  }

  const result = await AnalysisResult.findOne({ videoId: video._id });
  res.json({ video, result });
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  await AnalysisResult.deleteOne({ videoId: video._id });
  await Video.deleteOne({ _id: video._id });

  res.json({ message: "Video and analysis result deleted" });
});

export default router;
