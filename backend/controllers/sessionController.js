const mongoose = require("mongoose");
const StudySession = require("../models/StudySession");
const pick = require("../utils/pick");

const SESSION_FIELDS = [
  "durationMs", "attentiveMs", "drowsyMs", "attentionScore",
  "drowsinessEvents", "alertsPlayed", "startedAt", "endedAt",
];

exports.createSession = async (req, res) => {
  try {
    const session = await StudySession.create({
      ...pick(req.body, SESSION_FIELDS),
      userId: req.user._id, // always from the token, never from the body
    });
    res.status(201).json(session);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid session data" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to save session" });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Session not found" });
    }
    // Filtering by userId means someone else's session looks like it doesn't exist.
    const session = await StudySession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch session" });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Session not found" });
    }
    const deleted = await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete session" });
  }
};