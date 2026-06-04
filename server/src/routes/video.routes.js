import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware.js";
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

router.post("/upload", authenticate, upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Video file is required" });
  }

  const video = await Video.create({
    userId: req.user._id,
    originalName: req.file.originalname,
    fileName: req.file.filename,
    path: req.file.path
  });

  res.status(201).json({ video });
});

router.get("/", authenticate, async (req, res) => {
  const videos = await Video.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  const videoIds = videos.map((v) => v._id);
  const results = await AnalysisResult.find({ videoId: { $in: videoIds } }).lean();
  const resultsByVideoId = new Map(results.map((r) => [r.videoId.toString(), r]));

  res.json({
    videos: videos.map((v) => ({
      ...v,
      result: resultsByVideoId.get(v._id.toString()) || null
    }))
  });
});

router.post("/:id/analyze", authenticate, async (req, res) => {
  const video = await Video.findOne({ _id: req.params.id, userId: req.user._id });

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  try {
    const analysis = await analyzeVideoWithAI(video.path);
    const result = await AnalysisResult.findOneAndUpdate(
      { videoId: video._id },
      { videoId: video._id, isViolent: analysis.isViolent },
      { new: true, upsert: true }
    );

    res.json({ result });
  } catch (error) {
    res.status(502).json({ message: "AI analysis failed", detail: error.message });
  }
});

export default router;
