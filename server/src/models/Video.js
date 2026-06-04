import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    displayName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true }
  },
  { timestamps: true }
);

export const Video = mongoose.model("Video", videoSchema);
