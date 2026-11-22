const UserSettings = require("../models/UserSettings");
const pick = require("../utils/pick");

// The only fields a client may change. Sound fields are set by the sound routes.
const EDITABLE_FIELDS = [
  "earThreshold", "drowsyDurationMs", "alertVolume", "alertsEnabled", "headPoseEnabled",
];

exports.getSettings = async (req, res) => {
  try {
    // Find this user's settings, or create them with defaults on first visit.
    // One atomic upsert avoids a race when two requests arrive together.
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $setOnInsert: { userId: req.user._id } },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: pick(req.body, EDITABLE_FIELDS) },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid settings" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to update settings" });
  }
};