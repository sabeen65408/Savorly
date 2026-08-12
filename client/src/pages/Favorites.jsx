import { Heart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import { getFavorites } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function Favorites() {
  const { isAuthenticated, token, loading: authLoading, favoriteIds, refreshFavorites } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const response = await getFavorites(token);
      setRecipes(response?.recipes || []);
      await refreshFavorites();
    } catch (requestError) {
      setError(requestError?.message || "We couldn't load your saved recipes.");
    } finally {
      setLoading(false);
    }
  }, [refreshFavorites, token]);

  useEffect(() => {
    // The async request owns its state transitions.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFavorites();
  }, [loadFavorites]);

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app">
      <Navbar />
      <main className="favorites-page">
        <section className="favorites-header">
          <span className="eyebrow">YOUR RECIPE BOOK</span>
          <h1>Saved recipes</h1>
          <p>Keep your favourite dishes close for the next time you cook.</p>
        </section>

        <section className="favorites-content">
          {loading && <div className="loading-state"><div className="loading-spinner" /><h2>Loading saved recipes...</h2></div>}
          {!loading && error && (
            <div className="recipe-error-message" role="alert">
              <p>{error}</p><button type="button" onClick={loadFavorites}>Try again</button>
            </div>
          )}
          {!loading && !error && recipes.length === 0 && (
            <div className="empty-results">
              <div className="empty-icon"><Heart aria-hidden="true" /></div>
              <h2>No saved recipes yet</h2>
              <p>Tap the heart on a recipe to build your personal collection.</p>
              <Link to="/recipes" className="primary-btn">Explore recipes</Link>
            </div>
          )}
          {!loading && !error && recipes.length > 0 && (
            <div className="recipe-grid explorer-grid">
              {recipes.filter((recipe) => favoriteIds.includes(String(recipe._id))).map((recipe) => <RecipeCard key={recipe._id} recipe={recipe} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Favorites;
