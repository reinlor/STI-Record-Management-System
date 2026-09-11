const guidanceRoles = ["Admin", "Disciplinary", "Super Admin", "Teacher"];

function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required", status: 401 });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions", status: 403 });
    }

    return next();
  };
}

module.exports = {
  guidanceRoles,
  requireGuidanceRole: requireRole(guidanceRoles),
  requireRole,
};
