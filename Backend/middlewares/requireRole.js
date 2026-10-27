import User from "../models/user.model.js";

/**
 * Server-side role check. Must run after `isAuthenticated`.
 * Usage: router.post("/post", isAuthenticated, requireRole("recruiter"), handler)
 */
const requireRole =
  (...roles) =>
  async (req, res, next) => {
    try {
      const user = await User.findById(req.id).select("role");

      if (!user) {
        return res.status(401).json({
          message: "Account no longer exists. Please log in again.",
          success: false,
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: `This action is only available to ${roles.join(" / ")} accounts.`,
          success: false,
        });
      }

      req.role = user.role;
      return next();
    } catch (error) {
      return next(error);
    }
  };

export default requireRole;
