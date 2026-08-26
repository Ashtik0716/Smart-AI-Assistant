const mongoose = require("mongoose");

/**
 * Single-user settings document — since this app has no auth/login
 * system, we store exactly ONE settings document and always
 * upsert/read that same one (see settingsController.js).
 */
const userSettingsSchema = new mongoose.Schema({
  earThreshold: { type: Number, default: 0.5 },
  drowsyDurationMs: { type: Number, default: 2000 },
  alertVolume: { type: Number, default: 0.8 },
  alertsEnabled: { type: Boolean, default: true },
  headPoseEnabled: { type: Boolean, default: false },
  soundFileName: { type: String, default: null },
  soundFileUrl: { type: String, default: null },
});

module.exports = mongoose.model("UserSettings", userSettingsSchema);