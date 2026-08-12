import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecipeCard from "../components/RecipeCard";
import CategoryCard from "../components/CategoryCard";
import { getRecipes } from "../api/recipeApi";

const categories = [
  {
    name: "Breakfast",
    icon: "🍳",
    description: "Start your day deliciously",
  },
  {
    name: "Lunch",
    icon: "🍛",
    description: "Hearty meals for your day",
  },
  {
    name: "Dinner",
    icon: "🍲",
    description: "Comforting evening recipes",
  },
  {
    name: "Desserts",
    icon: "🍰",
    description: "Something sweet",
  },
  {
    name: "Snacks",
    icon: "🥨",
    description: "Perfect little bites",
  },
  {
    name: "Drinks",
    icon: "🥤",
    description: "Refreshing beverages",
  },
];

function Home() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [recipeError, setRecipeError] = useState("");

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoadingRecipes(true);
        setRecipeError("");
        const response = await getRecipes();
        const recipes = response?.recipes || [];
        setFeaturedRecipes([...recipes].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3));
      } catch {
        setRecipeError("We couldn't load featured recipes right now.");
      } finally {
        setLoadingRecipes(false);
      }
    };
    loadRecipes();
  }, []);

  return (
    <div className="app">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <span className="hero-badge">🍴 Discover • Cook • Share</span>

            <h1>
              Recipes made
              <br />
              <span>simple & delicious.</span>
            </h1>

            <p>
              Discover recipes from home cooks around the world, save your
              favorites, and cook along with step-by-step instructions.
            </p>

            <div className="hero-actions">
              <Link
                  to="/recipes"
                  className="primary-btn"
                >
                  Explore Recipes
                </Link>
              <Link
  to="/add-recipe"
  className="primary-btn"
>
  Add Your Recipe →
</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85"
                alt="Fresh homemade food"
              />
            </div>

            <div className="floating-card">
              <span>⭐</span>
              <div>
                <strong>4.9/5</strong>
                <small>Recipe ratings</small>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE</span>
              <h2>What are you craving?</h2>
            </div>

            <Link
  to="/recipes"
  className="text-btn"
>
  View all →
</Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="section featured-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">COMMUNITY FAVORITES</span>
              <h2>Popular recipes</h2>
            </div>

            <Link
  to="/recipes"
  className="text-btn"
>
  See all recipes →
</Link>
          </div>

          {loadingRecipes && <div className="loading-state compact-loading"><div className="loading-spinner" /><p>Loading featured recipes…</p></div>}
          {!loadingRecipes && recipeError && <div className="recipe-error-message" role="alert"><p>{recipeError}</p><Link to="/recipes">Browse all recipes</Link></div>}
          {!loadingRecipes && !recipeError && featuredRecipes.length === 0 && <div className="empty-results"><h3>No featured recipes yet</h3><p>Be the first to share something delicious.</p><Link className="primary-btn" to="/add-recipe">Add a recipe</Link></div>}
          {!loadingRecipes && !recipeError && featuredRecipes.length > 0 && <div className="recipe-grid">
            {featuredRecipes.map((recipe) => <RecipeCard key={recipe._id} recipe={recipe} />)}
          </div>}
        </section>

        {/* CTA */}
        <section className="creator-cta">
          <div>
            <span className="eyebrow">SHARE YOUR PASSION</span>

            <h2>
              Have a recipe
              <br />
              worth sharing?
            </h2>

            <p>
              Turn your favorite family recipe into something the whole
              community can enjoy.
            </p>

            <Link
  to="/recipes"
  className="primary-btn"
>
  Explore Recipes →
</Link>
          </div>

          <div className="cta-icon">🍳</div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
