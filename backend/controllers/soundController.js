const UserSettings = require("../models/UserSettings");

exports.uploadSound = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileUrl = `/uploads/sounds/${req.file.filename}`;

    await UserSettings.findOneAndUpdate(
      {},
      { soundFileName: req.file.originalname, soundFileUrl: fileUrl },
      { upsert: true }
    );

    res.status(201).json({ fileName: req.file.originalname, fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save sound" });
  }
};

exports.getSounds = async (req, res) => {
  try {
    const settings = await UserSettings.findOne();
    if (!settings || !settings.soundFileUrl) {
      return res.json([]);
    }
    res.json([{ fileName: settings.soundFileName, fileUrl: settings.soundFileUrl }]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sound" });
  }
};

exports.deleteSound = async (req, res) => {
  try {
    await UserSettings.findOneAndUpdate({}, { soundFileName: null, soundFileUrl: null });
    res.json({ message: "Sound removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove sound" });
  }
};