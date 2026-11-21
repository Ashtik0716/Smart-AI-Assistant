const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const sessionController = require("../controllers/sessionController");

router.use(requireAuth);

router.post("/", sessionController.createSession);
router.get("/", sessionController.getSessions);
router.get("/:id", sessionController.getSessionById);
router.delete("/:id", sessionController.deleteSession);

module.exports = router;