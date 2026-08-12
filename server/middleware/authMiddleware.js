const jwt = require("jsonwebtoken");

const authMiddleware = (
  req,
  res,
  next
) => {

  try {

    // =================================
    // GET AUTHORIZATION HEADER
    // =================================

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    // =================================
    // CHECK BEARER TOKEN
    // =================================

    const parts =
      authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format",
      });
    }

    const token =
      parts[1];

    // =================================
    // VERIFY TOKEN
    // =================================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // =================================
    // STORE USER INFO
    // =================================

    req.user = decoded;

    // =================================
    // CONTINUE
    // =================================

    next();

  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};

module.exports =
  authMiddleware;