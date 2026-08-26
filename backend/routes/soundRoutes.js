const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const soundController = require("../controllers/soundController");

router.post("/", (req, res, next) => {
  upload.single("sound")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, soundController.uploadSound);
router.get("/", soundController.getSounds);
router.delete("/:id", soundController.deleteSound);

module.exports = router;