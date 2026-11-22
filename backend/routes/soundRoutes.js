const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const upload = require("../config/multer");
const soundController = require("../controllers/soundController");

router.use(requireAuth); // must run before multer reads the upload

router.post(
  "/",
  (req, res, next) => {
    upload.single("sound")(req, res, (err) => {
      if (err) {
        const message = err.code === "LIMIT_FILE_SIZE" ? "That file is over 3 MB." : err.message;
        return res.status(400).json({ message });
      }
      next();
    });
  },
  soundController.uploadSound
);
router.get("/", soundController.getSounds);
router.get("/file", soundController.getSoundFile);
router.delete("/:id", soundController.deleteSound);

module.exports = router;