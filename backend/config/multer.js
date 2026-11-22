const multer = require("multer");
const path = require("path");

const MAX_BYTES = 3 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".mp3", ".wav"].includes(ext)) cb(null, true);
  else cb(new Error("Only .mp3 and .wav files are allowed"));
};

module.exports = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_BYTES, files: 1 },
});