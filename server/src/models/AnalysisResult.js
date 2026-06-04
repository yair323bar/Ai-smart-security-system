import mongoose from "mongoose";

const analysisResultSchema = new mongoose.Schema(
  {
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    isViolent: { type: Boolean, required: true }
  },
  { timestamps: true }
);

export const AnalysisResult = mongoose.model("AnalysisResult", analysisResultSchema);
