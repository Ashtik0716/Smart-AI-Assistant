const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Optional now: password-only accounts have no Google ID.
    // "sparse" lets many users have no googleId while real ones stay unique.
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    picture: { type: String, default: null },
    // select:false means queries never return the hash unless asked for explicitly.
    passwordHash: { type: String, default: null, select: false },
    // True only when Google has proven the person owns this email.
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);