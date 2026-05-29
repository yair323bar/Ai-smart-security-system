import { User } from "../models/User.js";
import { verifyToken } from "../utils/token.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "User is not allowed to access the system" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied for this role" });
    }

    next();
  };
}
