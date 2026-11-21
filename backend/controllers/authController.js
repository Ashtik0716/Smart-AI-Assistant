const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 12;
// Used when the email doesn't exist, so "no such user" and "wrong password"
// take about the same time. That stops attackers probing which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_ROUNDS);

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, picture: user.picture };
}

exports.register = async (req, res) => {
  // String() blocks object payloads like {"$gt": ""} from reaching the database query.
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name || name.length > 80) {
    return res.status(400).json({ message: "Please enter your name" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }
  // bcrypt only uses the first 72 bytes, so longer passwords are rejected rather than silently cut.
  if (password.length < 8 || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ message: "Password must be 8 to 72 characters" });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ name, email, passwordHash, emailVerified: false });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to create account" });
  }
};

exports.login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  try {
    const user = await User.findOne({ email }).select("+passwordHash");
    const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);

    // One generic message for every failure, whether the email is unknown,
    // the password is wrong, or the account is Google-only.
    if (!user || !user.passwordHash || !ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to sign in" });
  }
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: "Missing credential" });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error("Google token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid Google sign-in" });
  }

  if (!payload.email_verified) {
    return res.status(401).json({ message: "Google email is not verified" });
  }

  try {
    const email = payload.email.toLowerCase();
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // An account with this email already exists, so link Google to it.
        // If it was created with a password and the email was never verified,
        // that password may have been set by someone else, so discard it.
        // Google has now proven who owns the email.
        if (!user.emailVerified) user.passwordHash = null;
        user.googleId = payload.sub;
        user.emailVerified = true;
      } else {
        user = new User({
          googleId: payload.sub,
          email,
          name: payload.name || email,
          emailVerified: true,
        });
      }
    }

    user.picture = payload.picture || user.picture;
    await user.save();

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to sign in" });
  }
};

exports.getMe = (req, res) => {
  res.json({ user: publicUser(req.user) });
};