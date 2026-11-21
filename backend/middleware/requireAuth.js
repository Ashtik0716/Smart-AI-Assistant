const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protects a route. Expects "Authorization: Bearer <token>".
 * On success, attaches the logged-in user to req.user.
 */
module.exports = async function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};