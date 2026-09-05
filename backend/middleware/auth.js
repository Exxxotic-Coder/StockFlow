function requireAuth(req, res, next) {
  if (!req.session?.username) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  req.authenticatedUsername = req.session.username;
  next();
}

module.exports = { requireAuth };