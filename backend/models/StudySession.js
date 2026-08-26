const mongoose = require("mongoose");

/**
 * Represents one completed study session. Mirrors the data Camera.jsx
 * already tracks in React state (elapsedMs, drowsyEventCount, etc.) —
 * we're just persisting a snapshot of it when the user clicks Stop.
 */
const studySessionSchema = new mongoose.Schema(
  {
    durationMs: { type: Number, required: true }, // total session length
    attentiveMs: { type: Number, required: true }, // time spent attentive
    drowsyMs: { type: Number, required: true }, // time spent drowsy
    attentionScore: { type: Number, required: true }, // 0-100
    drowsinessEvents: { type: Number, required: true, default: 0 },
    alertsPlayed: { type: Number, required: true, default: 0 },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
  },
  { timestamps: true } // adds createdAt/updatedAt automatically
);

module.exports = mongoose.model("StudySession", studySessionSchema);