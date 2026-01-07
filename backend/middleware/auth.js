const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err.name, err.message);

    return res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid token",
    });
  }
};

module.exports = authMiddleware;
