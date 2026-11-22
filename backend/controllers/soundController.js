const path = require("path");
const UserSound = require("../models/UserSound");

/**
 * Looks at the first bytes of the file to decide what it really is, instead of
 * trusting the file name or the type the browser claims.
 */
function sniffAudio(buf) {
  if (buf.length < 12) return null;
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WAVE") {
    return "audio/wav";
  }
  if (buf.toString("ascii", 0, 3) === "ID3") return "audio/mpeg"; // MP3 with a tag
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return "audio/mpeg"; // raw MP3 frame
  return null;
}

exports.uploadSound = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const contentType = sniffAudio(req.file.buffer);
  if (!contentType) {
    return res.status(400).json({ message: "That doesn’t look like a valid .mp3 or .wav file" });
  }

  try {
    const fileName = path.basename(req.file.originalname).slice(0, 100);
    // Upsert replaces the user's previous sound, so there is never more than one.
    await UserSound.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { fileName, contentType, data: req.file.buffer } },
      { upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ fileName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save sound" });
  }
};

// Metadata only. The audio itself comes from getSoundFile.
exports.getSounds = async (req, res) => {
  try {
    const sound = await UserSound.findOne({ userId: req.user._id }).select("fileName");
    res.json(sound ? [{ fileName: sound.fileName }] : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sound" });
  }
};

exports.getSoundFile = async (req, res) => {
  try {
    const sound = await UserSound.findOne({ userId: req.user._id }).select("+data contentType");
    if (!sound) return res.status(404).json({ message: "No sound saved" });

    res.set({
      "Content-Type": sound.contentType, // from our own check, never from the client
      "Cache-Control": "private, no-cache", // revalidated each time, so a new upload shows up
      "X-Content-Type-Options": "nosniff",
    });
    res.send(sound.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load sound" });
  }
};

exports.deleteSound = async (req, res) => {
  try {
    await UserSound.deleteOne({ userId: req.user._id });
    res.json({ message: "Sound removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove sound" });
  }
};