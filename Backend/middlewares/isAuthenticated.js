import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: please log in.",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.userId;
    return next();
  } catch {
    return res.status(401).json({
      message: "Unauthorized: invalid or expired session.",
      success: false,
    });
  }
};

export default isAuthenticated;
