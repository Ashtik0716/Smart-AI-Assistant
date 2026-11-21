const fs = require("fs/promises");
const path = require("path");
const UserSettings = require("../models/UserSettings");

const SOUND_DIR = path.join(process.cwd(), "uploads", "sounds");

// basename() guarantees we can only ever delete files inside SOUND_DIR.
async function removeFile(fileUrl) {
  if (!fileUrl) return;
  try {
    await fs.unlink(path.join(SOUND_DIR, path.basename(fileUrl)));
  } catch (err) {
    if (err.code !== "ENOENT") console.error("Failed to delete sound file:", err.message);
  }
}

exports.uploadSound = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const fileUrl = `/uploads/sounds/${req.file.filename}`;

  try {
    // Without { new: true } this returns the document as it was before the update,
    // so we can delete the previous file instead of leaving it on disk.
    const previous = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { soundFileName: req.file.originalname.slice(0, 100), soundFileUrl: fileUrl } },
      { upsert: true, setDefaultsOnInsert: true }
    );
    await removeFile(previous?.soundFileUrl);
    res.status(201).json({ fileName: req.file.originalname.slice(0, 100), fileUrl });
  } catch (err) {
    console.error(err);
    await removeFile(fileUrl); // don't leave an orphan if the database write failed
    res.status(500).json({ message: "Failed to save sound" });
  }
};

exports.getSounds = async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ userId: req.user._id });
    if (!settings || !settings.soundFileUrl) return res.json([]);
    res.json([{ fileName: settings.soundFileName, fileUrl: settings.soundFileUrl }]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sound" });
  }
};

exports.deleteSound = async (req, res) => {
  try {
    const previous = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { soundFileName: null, soundFileUrl: null } }
    );
    await removeFile(previous?.soundFileUrl);
    res.json({ message: "Sound removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove sound" });
  }
};