const express = require("express");
const cors = require("cors");

const sessionRoutes = require("./routes/sessionRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const soundRoutes = require("./routes/soundRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/sessions", sessionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sounds", soundRoutes);

app.get("/", (req, res) => {
  res.json({ message: "FocusAI backend is running" });
});

module.exports = app;