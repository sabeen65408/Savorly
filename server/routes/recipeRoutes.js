const express = require("express");

const {
  createRecipe,
  getRecipes,
  getRecipe,
  getRelatedRecipes,
  translateRecipeToTamil,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

const router = express.Router();


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
  createRecipe
);


// =====================================
// UPDATE RECIPE
// =====================================

router.put(
  "/:id",
  updateRecipe
);


// =====================================
// DELETE RECIPE
// =====================================

router.delete(
  "/:id",
  deleteRecipe
);


module.exports = router;
