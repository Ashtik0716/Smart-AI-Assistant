const StudySession = require("../models/StudySession");

exports.createSession = async (req, res) => {
  try {
    const session = await StudySession.create(req.body);
    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to save session" });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch session" });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const deleted = await StudySession.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete session" });
  }
};