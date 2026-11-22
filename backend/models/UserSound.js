const mongoose = require("mongoose");

// One alarm sound per user. The audio lives in the database so it survives
// redeploys on hosts with temporary disks.
const userSoundSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fileName: { type: String, required: true },
    contentType: { type: String, required: true, enum: ["audio/mpeg", "audio/wav"] },
    // select:false keeps the audio out of every query unless it's asked for explicitly.
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSound", userSoundSchema);