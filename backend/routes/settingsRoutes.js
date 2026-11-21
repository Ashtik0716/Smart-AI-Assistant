const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const settingsController = require("../controllers/settingsController");

router.use(requireAuth);

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);

module.exports = router;