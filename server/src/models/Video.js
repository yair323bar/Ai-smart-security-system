import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["uploaded", "analyzing", "completed", "failed"],
      default: "uploaded"
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export const Video = mongoose.model("Video", videoSchema);
