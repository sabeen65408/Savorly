const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  toggleFavorite,
  getFavorites,
} = require("../controllers/authController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

// =====================================
// REGISTER
// =====================================

router.post(
  "/register",
  registerUser
);

// =====================================
// LOGIN
// =====================================

router.post(
  "/login",
  loginUser
);

// =====================================
// FORGOT PASSWORD
// =====================================

router.post(
  "/forgot-password",
  forgotPassword
);

// =====================================
// RESET PASSWORD
// =====================================

router.put(
  "/reset-password/:token",
  resetPassword
);

// =====================================
// CURRENT USER
// =====================================

router.get(
  "/me",
  authMiddleware,
  getMe
);

// =====================================
// ADD / REMOVE FAVORITE
// =====================================

router.put(
  "/favorites/:recipeId",
  authMiddleware,
  toggleFavorite
);

// =====================================
// GET MY FAVORITES
// =====================================

router.get(
  "/favorites",
  authMiddleware,
  getFavorites
);

module.exports = router;