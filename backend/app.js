const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const soundRoutes = require("./routes/soundRoutes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use((req, res, next) => {
  req.body ??= {}; // Express 5 leaves this undefined when there's no body
  next();
});


// General limit for the whole API; the auth routes add a stricter one on top.
app.use(
  "/api",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false })
);

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sounds", soundRoutes);

app.get("/", (req, res) => {
  res.json({ message: "FocusAI backend is running" });
});

module.exports = app;