const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    cuisine: {
      type: String,
      required: true,
    },

    diet: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: [
        "Easy",
        "Medium",
        "Hard",
      ],
      default: "Easy",
    },

    prepTime: {
      type: Number,
      default: 0,
    },

    cookTime: {
      type: Number,
      default: 0,
    },

    servings: {
      type: Number,
      default: 1,
    },

    image: {
      type: String,
      default: "",
    },

    ingredients: [
      {
        type: String,
        required: true,
      },
    ],

    instructions: [
      {
        type: String,
        required: true,
      },
    ],

    // Cached server-generated Tamil instructions for Listen & Cook.
    // Creator-provided Tamil instructions can also be stored here.
    instructionsTamil: [
      {
        type: String,
        trim: true,
      },
    ],

    rating: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: Number,
      default: 0,
    },

    author: {
      type: String,
      default: "Savorly Community",
    },

    // The account that created this recipe. Only this account can edit or delete it.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Recipe",
  recipeSchema
);
