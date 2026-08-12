import { useMemo, useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecipeCard from "../components/RecipeCard";
import { getRecipes } from "../api/recipeApi";

function RecipeExplorer() {
  const { category } = useParams();

  // ==============================
  // STATE
  // ==============================

  const [allRecipes, setAllRecipes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState(category || "All");

  const [selectedCuisine, setSelectedCuisine] =
    useState("All");

  const [selectedDiet, setSelectedDiet] =
    useState("All");

  const [selectedDifficulty, setSelectedDifficulty] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("popular");

  const [showFilters, setShowFilters] =
    useState(false);

  // ==============================
  // FILTER OPTIONS
  // ==============================

  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Dessert",
    "Drinks",
  ];

  const cuisines = [
    "All",
    "Indian",
    "South Indian",
    "Italian",
    "Chinese",
    "Mexican",
    "International",
  ];

  const diets = [
    "All",
    "Vegetarian",
    "Non-Vegetarian",
  ];

  const difficulties = [
    "All",
    "Easy",
    "Medium",
    "Hard",
  ];

  // ==============================
  // FETCH RECIPES FROM MONGODB
  // ==============================

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching recipes from MongoDB...");

        const response = await getRecipes();

        console.log(
          "Recipes API response:",
          response
        );

        if (
          response?.success &&
          Array.isArray(response.recipes)
        ) {
          setAllRecipes(response.recipes);
        } else {
          setAllRecipes([]);

          setError(
            "Unable to load recipes from the server."
          );
        }
      } catch (err) {
        console.error(
          "Failed to fetch recipes:",
          err
        );

        setError(
          "Unable to connect to the recipe server."
        );

        setAllRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // ==============================
  // UPDATE CATEGORY FROM URL
  // ==============================

  useEffect(() => {
    if (category) {
      // URL state is the source of truth for the selected category.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategory(category);
    } else {
      setSelectedCategory("All");
    }
  }, [category]);

  // ==============================
  // FILTER + SORT
  // ==============================

  const filteredRecipes = useMemo(() => {
    let result = allRecipes.filter((recipe) => {
      const searchText =
        search.trim().toLowerCase();

      const searchableText = [
        recipe.title,
        recipe.category,
        recipe.mealType,
        recipe.cuisine,
        recipe.diet,
        recipe.description,
        ...(recipe.tags || []),
        ...(recipe.ingredients || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // SEARCH
      const matchesSearch =
        !searchText ||
        searchableText.includes(searchText);

      // CATEGORY
      const matchesCategory =
        selectedCategory === "All" ||
        recipe.category === selectedCategory ||
        recipe.mealType === selectedCategory;

      // CUISINE
      const matchesCuisine =
        selectedCuisine === "All" ||
        recipe.cuisine === selectedCuisine;

      // DIET
      const matchesDiet =
        selectedDiet === "All" ||
        recipe.diet === selectedDiet;

      // DIFFICULTY
      const matchesDifficulty =
        selectedDifficulty === "All" ||
        recipe.difficulty === selectedDifficulty;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCuisine &&
        matchesDiet &&
        matchesDifficulty
      );
    });

    // ==============================
    // SORTING
    // ==============================

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          (b.rating || 0) -
          (a.rating || 0)
      );
    }

    if (sortBy === "reviews") {
      result.sort(
        (a, b) =>
          (b.reviews || 0) -
          (a.reviews || 0)
      );
    }

    if (sortBy === "time") {
      result.sort((a, b) => {
        const getTime = (recipe) => {
          if (recipe.time) {
            return (
              parseInt(recipe.time) || 0
            );
          }

          const prep =
            parseInt(recipe.prepTime) || 0;

          const cook =
            parseInt(recipe.cookTime) || 0;

          return prep + cook;
        };

        return getTime(a) - getTime(b);
      });
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        (a.title || "").localeCompare(
          b.title || ""
        )
      );
    }

    // "popular" currently keeps MongoDB order
    // which is newest first from the backend.

    return result;
  }, [
    allRecipes,
    search,
    selectedCategory,
    selectedCuisine,
    selectedDiet,
    selectedDifficulty,
    sortBy,
  ]);

  // ==============================
  // CLEAR FILTERS
  // ==============================

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedCuisine("All");
    setSelectedDiet("All");
    setSelectedDifficulty("All");
    setSortBy("popular");
  };

  // ==============================
  // ACTIVE FILTER COUNT
  // ==============================

  const activeFilterCount = [
    selectedCategory !== "All",
    selectedCuisine !== "All",
    selectedDiet !== "All",
    selectedDifficulty !== "All",
  ].filter(Boolean).length;

  // ==============================
  // LOADING STATE
  // ==============================

  if (loading) {
    return (
      <div className="app">
        <Navbar />

        <main className="explorer-page">
          <section className="explorer-content">
            <div className="loading-state">
              <div className="loading-spinner"></div>

              <h2>
                Loading delicious recipes...
              </h2>

              <p>
                Please wait while we fetch the recipes.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  // ==============================
  // PAGE
  // ==============================

  return (
    <div className="app">
      <Navbar />

      <main className="explorer-page">

        {/* ==========================
            HERO
        ========================== */}

        <section className="explorer-hero">
          <div className="explorer-hero-content">

            <span className="eyebrow">
              DISCOVER SOMETHING DELICIOUS
            </span>

            <h1>
              Find your next
              <br />
              favourite recipe
            </h1>

            <p>
              Explore delicious recipes for every
              mood, meal and moment.
            </p>

          </div>
        </section>

        {/* ==========================
            CONTENT
        ========================== */}

        <section className="explorer-content">

          {/* ========================
              SERVER ERROR
          ======================== */}

          {error && (
            <div className="recipe-error-message">
              <p>{error}</p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Retry
              </button>
            </div>
          )}

          {/* ========================
              SEARCH
          ======================== */}

          <div className="recipe-search">

            <Search size={20} />

            <input
              type="text"
              placeholder="Search by recipe, ingredient, cuisine..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}

          </div>

          {/* ========================
              TOOLBAR
          ======================== */}

          <div className="explorer-toolbar">

            {/* MOBILE FILTER BUTTON */}

            <button
              type="button"
              className="mobile-filter-btn"
              onClick={() =>
                setShowFilters(!showFilters)
              }
            >
              <SlidersHorizontal size={17} />

              Filters

              {activeFilterCount > 0 && (
                <span className="filter-count">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* DESKTOP FILTER LABEL */}

            <div className="desktop-filter-label">
              <SlidersHorizontal size={17} />
              Filters
            </div>

            {/* RESULT COUNT */}

            <div className="result-count">
              <strong>
                {filteredRecipes.length}
              </strong>{" "}

              {filteredRecipes.length === 1
                ? "recipe"
                : "recipes"}{" "}

              found
            </div>

            {/* SORT */}

            <div className="sort-wrapper">

              <ArrowUpDown size={16} />

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
              >
                <option value="popular">
                  Most Popular
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="reviews">
                  Most Reviewed
                </option>

                <option value="time">
                  Quickest
                </option>

                <option value="name">
                  A–Z
                </option>
              </select>

              <ChevronDown size={15} />

            </div>

          </div>

          {/* ========================
              FILTER PANEL
          ======================== */}

          <div
            className={
              showFilters
                ? "filters-panel open"
                : "filters-panel"
            }
          >

            {/* MEAL */}

            <div className="filter-group">

              <label>
                Meal
              </label>

              <div className="filter-options">

                {categories.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      selectedCategory === item
                        ? "filter-chip active"
                        : "filter-chip"
                    }
                    onClick={() =>
                      setSelectedCategory(item)
                    }
                  >
                    {item}
                  </button>
                ))}

              </div>
            </div>

            {/* CUISINE */}

            <div className="filter-group">

              <label>
                Cuisine
              </label>

              <div className="filter-options">

                {cuisines.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      selectedCuisine === item
                        ? "filter-chip active"
                        : "filter-chip"
                    }
                    onClick={() =>
                      setSelectedCuisine(item)
                    }
                  >
                    {item}
                  </button>
                ))}

              </div>
            </div>

            {/* DIET */}

            <div className="filter-group">

              <label>
                Diet
              </label>

              <div className="filter-options">

                {diets.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      selectedDiet === item
                        ? "filter-chip active"
                        : "filter-chip"
                    }
                    onClick={() =>
                      setSelectedDiet(item)
                    }
                  >
                    {item}
                  </button>
                ))}

              </div>
            </div>

            {/* DIFFICULTY */}

            <div className="filter-group">

              <label>
                Difficulty
              </label>

              <div className="filter-options">

                {difficulties.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      selectedDifficulty === item
                        ? "filter-chip active"
                        : "filter-chip"
                    }
                    onClick={() =>
                      setSelectedDifficulty(item)
                    }
                  >
                    {item}
                  </button>
                ))}

              </div>
            </div>

            {/* CLEAR FILTERS */}

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            )}

          </div>

          {/* ========================
              SEARCH MESSAGE
          ======================== */}

          {search && (
            <div className="search-result-message">
              Results for{" "}

              <strong>
                "{search}"
              </strong>
            </div>
          )}

          {/* ========================
              RESULTS
          ======================== */}

          {filteredRecipes.length > 0 ? (

            <div className="recipe-grid explorer-grid">

              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={
                    recipe._id ||
                    recipe.id
                  }
                  recipe={recipe}
                />
              ))}

            </div>

          ) : (

            <div className="empty-results">

              <div className="empty-icon">
                🍽️
              </div>

              <h2>
                Nothing delicious here yet
              </h2>

              <p>
                {allRecipes.length === 0
                  ? "There are no recipes in Savorly yet. Be the first to add one!"
                  : "Try changing your search or filters."}
              </p>

              <button
                type="button"
                className="primary-btn"
                onClick={clearFilters}
              >
                Reset everything
              </button>

            </div>

          )}

        </section>
      </main>

      <Footer />
    </div>
  );
}

export default RecipeExplorer;
