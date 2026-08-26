const UserSettings = require("../models/UserSettings");

exports.getSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne();
    if (!settings) {
      settings = await UserSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await UserSettings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to update settings" });
  }
};