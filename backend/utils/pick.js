/**
 * Copies only the listed keys from an object. Controllers use this so a client
 * can't sneak in extra fields like userId or soundFileUrl (mass assignment).
 */
module.exports = function pick(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (obj && obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
};