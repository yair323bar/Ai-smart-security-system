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

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}
