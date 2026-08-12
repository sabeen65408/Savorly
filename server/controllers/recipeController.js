const Recipe = require("../models/Recipe");

const translateRecipeToTamil = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    if (recipe.instructionsTamil?.length === recipe.instructions.length) {
      return res.status(200).json({
        success: true,
        instructionsTamil: recipe.instructionsTamil,
        cached: true,
      });
    }

    // LibreTranslate runs separately from Savorly, so port 5001 avoids
    // colliding with the Express API on port 5000.
    const endpoint = (
      process.env.LIBRETRANSLATE_URL ||
      "http://localhost:5001"
    ).replace(/\/$/, "");

    const translateInstruction = async (instruction) => {
      const payload = {
        q: instruction,
        source: "en",
        target: "ta",
        format: "text",
      };

      if (process.env.LIBRETRANSLATE_API_KEY) {
        payload.api_key = process.env.LIBRETRANSLATE_API_KEY;
      }

      let translationResponse;

      try {
        translationResponse = await fetch(`${endpoint}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (providerError) {
        throw new Error("LibreTranslate is not running");
      }

      if (!translationResponse.ok) {
        console.error("LibreTranslate error:", translationResponse.status);
        throw new Error("LibreTranslate could not translate this instruction");
      }

      const translation = await translationResponse.json();

      if (!translation.translatedText) {
        throw new Error("LibreTranslate returned an incomplete translation");
      }

      return translation.translatedText;
    };

    let instructionsTamil;

    try {
      instructionsTamil = await Promise.all(
        recipe.instructions.map(translateInstruction)
      );
    } catch (translationError) {
      return res.status(503).json({
        success: false,
        message:
          "Tamil translation service is unavailable. Start LibreTranslate and try again.",
      });
    }

    if (instructionsTamil.length !== recipe.instructions.length || instructionsTamil.some((item) => !item)) {
      return res.status(502).json({
        success: false,
        message: "Tamil translation could not be completed",
      });
    }

    recipe.instructionsTamil = instructionsTamil;
    await recipe.save();

    return res.status(200).json({
      success: true,
      instructionsTamil,
      cached: false,
    });
  } catch (error) {
    console.error("Tamil translation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to translate recipe instructions",
    });
  }
};

// =====================================
// CREATE RECIPE
// =====================================

const createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      recipe,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create recipe",
      error: error.message,
    });
  }
};


// =====================================
// GET ALL RECIPES
// =====================================

const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recipes",
      error: error.message,
    });
  }
};


// =====================================
// GET SINGLE RECIPE
// =====================================

const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(
      req.params.id
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recipe",
      error: error.message,
    });
  }
};


// =====================================
// GET RELATED RECIPES
// =====================================

const getRelatedRecipes = async (req, res) => {
  try {
    const currentRecipe = await Recipe.findById(
      req.params.id
    );

    // ---------------------------------
    // Check current recipe
    // ---------------------------------

    if (!currentRecipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // ---------------------------------
    // Find related recipes
    // Same category OR same cuisine
    // Exclude current recipe
    // ---------------------------------

    const relatedRecipes = await Recipe.find({
      _id: {
        $ne: currentRecipe._id,
      },

      $or: [
        {
          category: currentRecipe.category,
        },
        {
          cuisine: currentRecipe.cuisine,
        },
      ],
    })
      .sort({
        createdAt: -1,
      })
      .limit(3);

    // ---------------------------------
    // Response
    // ---------------------------------

    res.status(200).json({
      success: true,
      count: relatedRecipes.length,
      recipes: relatedRecipes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch related recipes",
      error: error.message,
    });
  }
};


// =====================================
// UPDATE RECIPE
// =====================================

const updateRecipe = async (req, res) => {
  try {
    const recipe =
      await Recipe.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      recipe,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update recipe",
      error: error.message,
    });
  }
};


// =====================================
// DELETE RECIPE
// =====================================

const deleteRecipe = async (req, res) => {
  try {
    const recipe =
      await Recipe.findByIdAndDelete(
        req.params.id
      );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete recipe",
      error: error.message,
    });
  }
};


// =====================================
// EXPORT CONTROLLERS
// =====================================

module.exports = {
  createRecipe,
  getRecipes,
  getRecipe,
  getRelatedRecipes,
  translateRecipeToTamil,
  updateRecipe,
  deleteRecipe,
};
