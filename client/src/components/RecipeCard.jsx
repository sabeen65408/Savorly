import {
  Clock,
  Heart,
  ArrowUpRight,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, favoriteIds, toggleFavorite } = useAuth();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  // ==============================
  // RECIPE ID
  // ==============================

  const recipeId =
    recipe._id || recipe.id;

  // ==============================
  // RECIPE TIME
  // ==============================

  const recipeTime =
    recipe.time ||
    (
      (parseInt(recipe.prepTime) || 0) +
      (parseInt(recipe.cookTime) || 0)
    );

  // ==============================
  // RECIPE IMAGE
  // ==============================

  const image =
    recipe.image ||
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352";

  const isFavorite = favoriteIds.includes(String(recipeId));
  const isOwner = Boolean(
    isAuthenticated &&
    recipe.createdBy &&
    String(recipe.createdBy._id || recipe.createdBy) === String(user?._id)
  );

  const handleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!recipeId) return;

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/recipes/${recipeId}` } });
      return;
    }

    try {
      setFavoriteError("");
      setIsTogglingFavorite(true);
      await toggleFavorite(recipeId);
    } catch (error) {
      setFavoriteError(error.message || "Unable to update saved recipes.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <article className="recipe-card">

      {/* ==========================
          IMAGE
      ========================== */}

      <div className="recipe-image">

        <img
          src={image}
          alt={recipe.title}
        />

        {/* FAVORITE */}

        <button
          type="button"
          className="favorite-btn"
          aria-label={isFavorite ? "Remove from saved recipes" : "Save recipe"}
          aria-pressed={isFavorite}
          disabled={isTogglingFavorite || !recipeId}
          onClick={handleFavorite}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>

        {/* CATEGORY */}

        {recipe.category && (
          <span className="recipe-category">
            {recipe.category}
          </span>
        )}

      </div>

      {/* ==========================
          CONTENT
      ========================== */}

      <div className="recipe-content">

        <h3>
          {recipe.title}
        </h3>

        {/* DESCRIPTION */}

        {recipe.description && (
          <p className="recipe-description">
            {recipe.description}
          </p>
        )}

        {/* META */}

        <div className="recipe-meta">

          <span>
            <Clock size={15} />

            {recipeTime
              ? `${recipeTime} min`
              : "Time unavailable"}
          </span>

          {recipe.difficulty && (
            <span className="recipe-difficulty">
              {recipe.difficulty}
            </span>
          )}

        </div>

        {favoriteError && (
          <p className="card-inline-error" role="alert">{favoriteError}</p>
        )}

        {/* VIEW RECIPE */}

        <div className="recipe-card-actions">

  <Link
    to={`/recipes/${recipeId}`}
    className="view-recipe-link"
  >
    View recipe

    <ArrowUpRight size={17} />
  </Link>

  {isOwner && <Link
      to={`/recipes/${recipeId}/edit`}
      className="card-edit-btn"
    >
      Edit
    </Link>}

</div>

      </div>

    </article>
  );
}

export default RecipeCard;
