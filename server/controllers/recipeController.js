const Recipe = require("../models/Recipe");
const Review = require("../models/Review");

const refreshRecipeRating = async (recipeId) => {
  const summary = await Review.aggregate([
    { $match: { recipe: recipeId } },
    { $group: { _id: "$recipe", rating: { $avg: "$rating" }, reviews: { $sum: 1 } } },
  ]);
  const values = summary[0] || { rating: 0, reviews: 0 };
  return Recipe.findByIdAndUpdate(recipeId, {
    rating: Math.round(values.rating * 10) / 10,
    reviews: values.reviews,
  }, { new: true });
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ recipe: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load reviews" });
  }
};

const upsertReview = async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Please choose a rating from 1 to 5 stars" });
    }
    if (comment.length > 1000) {
      return res.status(400).json({ success: false, message: "Your review must be 1000 characters or fewer" });
    }
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });

    const review = await Review.findOneAndUpdate(
      { recipe: recipe._id, user: req.user.userId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate("user", "name");
    const updatedRecipe = await refreshRecipeRating(recipe._id);
    return res.status(200).json({ success: true, message: "Your review has been saved", review, recipe: updatedRecipe });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to save your review" });
  }
};

const translateRecipeToTamil = async (req, res) => {
  try {
    // Check if API key is configured
    if (!process.env.SARVAM_API_KEY) {
      console.error("SARVAM_API_KEY is not configured");
      return res.status(500).json({
        success: false,
        message: "Translation service is not configured. Please contact the administrator.",
      });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Return cached Tamil instructions if they exist and match the English instructions count
    if (recipe.instructionsTamil?.length === recipe.instructions.length) {
      return res.status(200).json({
        success: true,
        instructionsTamil: recipe.instructionsTamil,
        cached: true,
      });
    }

    // Sarvam AI Translation API
    const SARVAM_API_ENDPOINT = "https://api.sarvam.ai/translate";

    const translateInstruction = async (instruction) => {
      const payload = {
        input: instruction,
        source_language_code: "en-IN",
        target_language_code: "ta-IN",
      };

      let translationResponse;

      try {
        translationResponse = await fetch(SARVAM_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": process.env.SARVAM_API_KEY,
          },
          body: JSON.stringify(payload),
        });
      } catch (networkError) {
        console.error("Sarvam API connection failed:", networkError.message);
        throw new Error("Translation service is temporarily unavailable. Please try again.");
      }

      // Handle non-2xx HTTP responses
      if (!translationResponse.ok) {
        const responseBody = await translationResponse.text();
        console.error(
          `Sarvam API returned HTTP ${translationResponse.status}:`,
          responseBody.slice(0, 500)
        );

        if (translationResponse.status === 401 || translationResponse.status === 403) {
          throw new Error("Translation service authentication failed. Invalid API key.");
        }

        if (translationResponse.status === 429) {
          throw new Error("Translation service rate limit exceeded. Please try again later.");
        }

        throw new Error(`Translation service error (HTTP ${translationResponse.status})`);
      }

      // Parse the JSON response
      let data;
      try {
        data = await translationResponse.json();
      } catch (jsonError) {
        console.error("Failed to parse Sarvam response as JSON");
        throw new Error("Translation service returned invalid response format");
      }

      // Check if translated_text exists in response
      if (!data.translated_text) {
        console.error("Sarvam response missing translated_text field:", data);
        throw new Error("Translation service returned incomplete response");
      }

      return data.translated_text;
    };

    // Translate all instructions in parallel
    let instructionsTamil;
    try {
      instructionsTamil = await Promise.all(
        recipe.instructions.map(translateInstruction)
      );
    } catch (translationError) {
      console.error("Tamil translation error:", translationError.message);
      return res.status(503).json({
        success: false,
        message: translationError.message || "Unable to translate recipe instructions. Please try again.",
      });
    }

    // Validate translation results
    if (
      !Array.isArray(instructionsTamil) ||
      instructionsTamil.length !== recipe.instructions.length ||
      instructionsTamil.some((item) => !item || typeof item !== "string")
    ) {
      console.error("Invalid Tamil instructions received:", instructionsTamil);
      return res.status(502).json({
        success: false,
        message: "Tamil translation could not be completed. Please try again.",
      });
    }

    // Cache the Tamil translation in the database
    recipe.instructionsTamil = instructionsTamil;
    await recipe.save();

    return res.status(200).json({
      success: true,
      instructionsTamil,
      cached: false,
    });
  } catch (error) {
    console.error("Tamil translation controller error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to translate recipe instructions. Please try again.",
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
  getReviews,
  upsertReview,
  translateRecipeToTamil,
  updateRecipe,
  deleteRecipe,
};
