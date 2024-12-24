import jwt from "jsonwebtoken";
import User from "../models/User/userModel.js";
import { httpResponse } from "../utils/httpResponse.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return httpResponse.UNAUTHORIZED(res, null, "Not authorized, no token")
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return httpResponse.FORBIDDEN(res, null, "Not authorized for this route")
    }
    next();
  };
};