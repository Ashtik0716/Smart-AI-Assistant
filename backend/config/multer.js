const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const SOUND_DIR = path.join(process.cwd(), "uploads", "sounds");
fs.mkdirSync(SOUND_DIR, { recursive: true }); // works on a fresh clone too

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, SOUND_DIR),
  // Random names: nobody can overwrite another user's file, and the URL can't be guessed.
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".mp3", ".wav"].includes(ext)) cb(null, true);
  else cb(new Error("Only .mp3 and .wav files are allowed"));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });