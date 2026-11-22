const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    durationMs: { type: Number, required: true, min: 0 },
    attentiveMs: { type: Number, required: true, min: 0 },
    drowsyMs: { type: Number, required: true, min: 0 },
    attentionScore: { type: Number, required: true, min: 0, max: 100 },
    drowsinessEvents: { type: Number, required: true, default: 0, min: 0 },
    alertsPlayed: { type: Number, required: true, default: 0, min: 0 },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudySession", studySessionSchema);