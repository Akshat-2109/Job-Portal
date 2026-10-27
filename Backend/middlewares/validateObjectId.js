import { isValidObjectId } from "../utils/validators.js";

/** Rejects malformed Mongo ids with 400 instead of a 500 CastError. */
const validateObjectId =
  (paramName = "id") =>
  (req, res, next) => {
    if (!isValidObjectId(req.params[paramName])) {
      return res.status(400).json({
        message: "Invalid ID format.",
        success: false,
      });
    }
    return next();
  };

export default validateObjectId;
