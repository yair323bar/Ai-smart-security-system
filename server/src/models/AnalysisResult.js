import mongoose from "mongoose";

const violentSegmentSchema = new mongoose.Schema(
  {
    clipIndex: Number,
    startSecond: Number,
    endSecond: Number,
    confidence: {
      type: Number,
      default: null
    }
  },
  { _id: false }
);

const analysisResultSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isViolent: {
      type: Boolean,
      required: true
    },
    totalClips: {
      type: Number,
      required: true
    },
    violentSegments: {
      type: [violentSegmentSchema],
      default: []
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success"
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

export const AnalysisResult = mongoose.model("AnalysisResult", analysisResultSchema);
