const mongoose = require("mongoose");

// One settings document per user. The unique index enforces that.
const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  earThreshold: { type: Number, default: 0.5, min: 0.1, max: 0.9 },
  drowsyDurationMs: { type: Number, default: 2000, min: 500, max: 10000 },
  alertVolume: { type: Number, default: 0.8, min: 0, max: 1 },
  alertsEnabled: { type: Boolean, default: true },
  headPoseEnabled: { type: Boolean, default: false },
});

module.exports = mongoose.model("UserSettings", userSettingsSchema);