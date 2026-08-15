const express = require("express");

const {
  createRecipe,
  getRecipes,
  getRecipe,
  getRelatedRecipes,
  getReviews,
  upsertReview,
  translateRecipeToTamil,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");


// =====================================
// GET ALL RECIPES
// =====================================

router.get(
  "/",
  getRecipes
);


// =====================================
// GET RELATED RECIPES
// IMPORTANT:
// This must come BEFORE /:id
// =====================================

router.get(
  "/:id/related",
  getRelatedRecipes
);

router.get("/:id/reviews", getReviews);
router.put("/:id/reviews", authMiddleware, upsertReview);

// Translate and cache Tamil instructions for Listen & Cook.
router.post(
  "/:id/translate/tamil",
  translateRecipeToTamil
);


// =====================================
// GET SINGLE RECIPE
// =====================================

router.get(
  "/:id",
  getRecipe
);


// =====================================
// CREATE RECIPE
// =====================================

router.post(
  "/",
  authMiddleware,
  createRecipe
);


// =====================================
// UPDATE RECIPE
// =====================================

router.put(
  "/:id",
  authMiddleware,
  updateRecipe
);


// =====================================
// DELETE RECIPE
// =====================================

router.delete(
  "/:id",
  authMiddleware,
  deleteRecipe
);


module.exports = router;
