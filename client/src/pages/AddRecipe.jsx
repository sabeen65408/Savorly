import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ImagePlus,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { createRecipe } from "../api/recipeApi";

function AddRecipe() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    cuisine: "",
    diet: "",
    difficulty: "Easy",
    prepTime: "",
    cookTime: "",
    servings: 2,
    image: "",
  });

  const [ingredients, setIngredients] = useState([
    "",
  ]);

  const [instructions, setInstructions] = useState([
    "",
  ]);

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =====================================
  // HANDLE FORM CHANGE
  // =====================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));
  };


  // =====================================
  // INGREDIENT FUNCTIONS
  // =====================================

  const addIngredient = () => {
    setIngredients((previous) => [
      ...previous,
      "",
    ]);
  };

  const updateIngredient = (index, value) => {
    setIngredients((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? value
          : item
      )
    );

    setErrors((previous) => ({
      ...previous,
      ingredients: "",
    }));
  };

  const removeIngredient = (index) => {
    if (ingredients.length === 1) return;

    setIngredients((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };


  // =====================================
  // INSTRUCTION FUNCTIONS
  // =====================================

  const addInstruction = () => {
    setInstructions((previous) => [
      ...previous,
      "",
    ]);
  };

  const updateInstruction = (index, value) => {
    setInstructions((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? value
          : item
      )
    );

    setErrors((previous) => ({
      ...previous,
      instructions: "",
    }));
  };

  const removeInstruction = (index) => {
    if (instructions.length === 1) return;

    setInstructions((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };


  // =====================================
  // VALIDATE FORM
  // =====================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title =
        "Recipe title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description =
        "Please add a short description";
    }

    if (!formData.category) {
      newErrors.category =
        "Please select a category";
    }

    if (!formData.cuisine) {
      newErrors.cuisine =
        "Please select a cuisine";
    }

    if (!formData.diet) {
      newErrors.diet =
        "Please select a diet";
    }

    const validIngredients =
      ingredients.filter(
        (item) => item.trim()
      );

    if (validIngredients.length === 0) {
      newErrors.ingredients =
        "Add at least one ingredient";
    }

    const validInstructions =
      instructions.filter(
        (item) => item.trim()
      );

    if (validInstructions.length === 0) {
      newErrors.instructions =
        "Add at least one instruction";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };


  // =====================================
  // SUBMIT RECIPE
  // =====================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setIsSubmitting(true);

      setErrors((previous) => ({
        ...previous,
        submit: "",
      }));

      // ---------------------------------
      // Prepare recipe data
      // ---------------------------------

      const recipeData = {
        title: formData.title.trim(),

        description:
          formData.description.trim(),

        category: formData.category,

        cuisine: formData.cuisine,

        diet: formData.diet,

        difficulty: formData.difficulty,

        prepTime: Number(
          formData.prepTime || 0
        ),

        cookTime: Number(
          formData.cookTime || 0
        ),

        servings: Number(
          formData.servings || 1
        ),

        image:
          formData.image.trim() ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",

        ingredients:
          ingredients
            .filter((item) => item.trim())
            .map((item) => item.trim()),

        instructions:
          instructions
            .filter((item) => item.trim())
            .map((item) => item.trim()),

        rating: 0,

        reviews: 0,

        author: "Savorly Community",

        tags: [],
      };

      console.log(
        "Creating recipe:",
        recipeData
      );

      // ---------------------------------
      // Send recipe to MongoDB
      // ---------------------------------

      const response =
        await createRecipe(recipeData);

      console.log(
        "Create Recipe API response:",
        response
      );

      // ---------------------------------
      // Check API response
      // ---------------------------------

      if (
        response?.success &&
        response?.recipe
      ) {
        const createdRecipe =
          response.recipe;

        // MongoDB generated ID
        const recipeId =
          createdRecipe._id;

        console.log(
          "Recipe created with MongoDB ID:",
          recipeId
        );

        // ---------------------------------
        // Navigate to recipe details
        // ---------------------------------

        navigate(
          `/recipes/${recipeId}`
        );

        return;
      }

      // ---------------------------------
      // Unexpected API response
      // ---------------------------------

      setErrors({
        submit:
          response?.message ||
          "Failed to publish recipe. Please try again.",
      });
    } catch (error) {
      console.error(
        "Failed to create recipe:",
        error
      );

      setErrors({
        submit:
          error?.response?.data?.message ||
          "Something went wrong while publishing the recipe.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="app">

      {/* =====================================
          NAVBAR
      ====================================== */}

      <header className="navbar">

        <div className="navbar-inner">

          <Link
            className="logo"
            to="/"
          >
            <span className="logo-icon">
              S
            </span>

            <span>
              Savorly
            </span>
          </Link>

          <Link
            to="/recipes"
            className="add-recipe-back"
          >
            Cancel
          </Link>

        </div>

      </header>


      {/* =====================================
          MAIN
      ====================================== */}

      <main className="add-recipe-page">

        {/* =================================
            HEADER
        ================================== */}

        <section className="add-recipe-header">

          <Link
            to="/recipes"
            className="back-link"
          >
            <ArrowLeft size={17} />

            Back to recipes
          </Link>

          <span className="eyebrow">
            SHARE SOMETHING DELICIOUS
          </span>

          <h1>
            Add your recipe
          </h1>

          <p>
            Have a recipe worth sharing?
            Add it to the Savorly community.
          </p>

        </section>


        {/* =================================
            FORM
        ================================== */}

        <form
          className="recipe-form"
          onSubmit={handleSubmit}
        >

          {/* =================================
              BASIC DETAILS
          ================================== */}

          <section className="form-section">

            <div className="form-section-heading">

              <span>
                01
              </span>

              <div>

                <h2>
                  Recipe details
                </h2>

                <p>
                  Tell us about your recipe.
                </p>

              </div>

            </div>


            <div className="form-grid">

              {/* TITLE */}

              <div className="form-field full">

                <label>
                  Recipe title *
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Creamy Garlic Pasta"
                  value={formData.title}
                  onChange={handleChange}
                />

                {errors.title && (
                  <span className="field-error">
                    {errors.title}
                  </span>
                )}

              </div>


              {/* DESCRIPTION */}

              <div className="form-field full">

                <label>
                  Short description *
                </label>

                <textarea
                  name="description"
                  rows="4"
                  placeholder="Tell people what makes this recipe special..."
                  value={formData.description}
                  onChange={handleChange}
                />

                {errors.description && (
                  <span className="field-error">
                    {errors.description}
                  </span>
                )}

              </div>


              {/* CATEGORY */}

              <div className="form-field">

                <label>
                  Meal category *
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="Breakfast">
                    Breakfast
                  </option>

                  <option value="Lunch">
                    Lunch
                  </option>

                  <option value="Dinner">
                    Dinner
                  </option>

                  <option value="Dessert">
                    Dessert
                  </option>

                  <option value="Drinks">
                    Drinks
                  </option>

                </select>

                {errors.category && (
                  <span className="field-error">
                    {errors.category}
                  </span>
                )}

              </div>


              {/* CUISINE */}

              <div className="form-field">

                <label>
                  Cuisine *
                </label>

                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                >

                  <option value="">
                    Select cuisine
                  </option>

                  <option value="Indian">
                    Indian
                  </option>

                  <option value="South Indian">
                    South Indian
                  </option>

                  <option value="Italian">
                    Italian
                  </option>

                  <option value="Chinese">
                    Chinese
                  </option>

                  <option value="Mexican">
                    Mexican
                  </option>

                  <option value="International">
                    International
                  </option>

                </select>

                {errors.cuisine && (
                  <span className="field-error">
                    {errors.cuisine}
                  </span>
                )}

              </div>


              {/* DIET */}

              <div className="form-field">

                <label>
                  Diet *
                </label>

                <select
                  name="diet"
                  value={formData.diet}
                  onChange={handleChange}
                >

                  <option value="">
                    Select diet
                  </option>

                  <option value="Vegetarian">
                    Vegetarian
                  </option>

                  <option value="Non-Vegetarian">
                    Non-Vegetarian
                  </option>

                </select>

                {errors.diet && (
                  <span className="field-error">
                    {errors.diet}
                  </span>
                )}

              </div>


              {/* DIFFICULTY */}

              <div className="form-field">

                <label>
                  Difficulty
                </label>

                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                >

                  <option value="Easy">
                    Easy
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Hard">
                    Hard
                  </option>

                </select>

              </div>

            </div>

          </section>


          {/* =================================
              TIME & SERVINGS
          ================================== */}

          <section className="form-section">

            <div className="form-section-heading">

              <span>
                02
              </span>

              <div>

                <h2>
                  Timing & servings
                </h2>

                <p>
                  Help cooks plan their meal.
                </p>

              </div>

            </div>


            <div className="form-grid three">

              {/* PREP TIME */}

              <div className="form-field">

                <label>
                  Prep time
                </label>

                <div className="input-with-unit">

                  <input
                    type="number"
                    min="0"
                    name="prepTime"
                    placeholder="10"
                    value={formData.prepTime}
                    onChange={handleChange}
                  />

                  <span>
                    min
                  </span>

                </div>

              </div>


              {/* COOK TIME */}

              <div className="form-field">

                <label>
                  Cook time
                </label>

                <div className="input-with-unit">

                  <input
                    type="number"
                    min="0"
                    name="cookTime"
                    placeholder="20"
                    value={formData.cookTime}
                    onChange={handleChange}
                  />

                  <span>
                    min
                  </span>

                </div>

              </div>


              {/* SERVINGS */}

              <div className="form-field">

                <label>
                  Servings
                </label>

                <input
                  type="number"
                  min="1"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>


          {/* =================================
              INGREDIENTS
          ================================== */}

          <section className="form-section">

            <div className="form-section-heading">

              <span>
                03
              </span>

              <div>

                <h2>
                  Ingredients
                </h2>

                <p>
                  Add everything needed to make
                  your recipe.
                </p>

              </div>

            </div>


            <div className="dynamic-list">

              {ingredients.map(
                (ingredient, index) => (

                  <div
                    className="dynamic-row"
                    key={index}
                  >

                    <GripVertical
                      size={18}
                      className="drag-icon"
                    />

                    <span className="row-number">
                      {index + 1}
                    </span>

                    <input
                      type="text"
                      placeholder="e.g. 2 cups basmati rice"
                      value={ingredient}
                      onChange={(event) =>
                        updateIngredient(
                          index,
                          event.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() =>
                        removeIngredient(index)
                      }
                    >

                      <Trash2 size={17} />

                    </button>

                  </div>

                )
              )}

            </div>


            {errors.ingredients && (
              <span className="field-error">
                {errors.ingredients}
              </span>
            )}


            <button
              type="button"
              className="add-row-btn"
              onClick={addIngredient}
            >

              <Plus size={17} />

              Add ingredient

            </button>

          </section>


          {/* =================================
              INSTRUCTIONS
          ================================== */}

          <section className="form-section">

            <div className="form-section-heading">

              <span>
                04
              </span>

              <div>

                <h2>
                  Cooking instructions
                </h2>

                <p>
                  Write clear steps so anyone
                  can follow along.
                </p>

              </div>

            </div>


            <div className="instructions-form-list">

              {instructions.map(
                (instruction, index) => (

                  <div
                    className="instruction-form-row"
                    key={index}
                  >

                    <div className="instruction-number">
                      {index + 1}
                    </div>

                    <textarea
                      rows="3"
                      placeholder={
                        index === 0
                          ? "Start with your first cooking step..."
                          : "Describe the next step..."
                      }
                      value={instruction}
                      onChange={(event) =>
                        updateInstruction(
                          index,
                          event.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() =>
                        removeInstruction(index)
                      }
                    >

                      <Trash2 size={17} />

                    </button>

                  </div>

                )
              )}

            </div>


            {errors.instructions && (
              <span className="field-error">
                {errors.instructions}
              </span>
            )}


            <button
              type="button"
              className="add-row-btn"
              onClick={addInstruction}
            >

              <Plus size={17} />

              Add cooking step

            </button>

          </section>


          {/* =================================
              IMAGE
          ================================== */}

          <section className="form-section">

            <div className="form-section-heading">

              <span>
                05
              </span>

              <div>

                <h2>
                  Recipe image
                </h2>

                <p>
                  Add a beautiful image of your
                  finished dish.
                </p>

              </div>

            </div>


            <div className="image-upload">

              <ImagePlus size={35} />

              <h3>
                Add your recipe image
              </h3>

              <p>
                Image upload will be connected
                to cloud storage later.
              </p>

              <input
                type="url"
                name="image"
                placeholder="Paste an image URL for now"
                value={formData.image}
                onChange={handleChange}
              />

            </div>

          </section>


          {/* =================================
              SUBMIT
          ================================== */}

          <section className="publish-section">

            <div>

              <h2>
                Ready to share?
              </h2>

              <p>
                Review your recipe and publish
                it to Savorly.
              </p>

              {errors.submit && (
                <span className="field-error">
                  {errors.submit}
                </span>
              )}

            </div>


            <button
              type="submit"
              className="publish-btn"
              disabled={isSubmitting}
            >

              {isSubmitting
                ? "Publishing..."
                : "Publish recipe"}

              {!isSubmitting && (
                <ChevronRight size={18} />
              )}

            </button>

          </section>

        </form>

      </main>

    </div>
  );
}

export default AddRecipe;