import {
  ArrowLeft,
  Star,
  Heart,
  Check,
  Trash2,
  X,
} from "lucide-react";

import {
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecipeCard from "../components/RecipeCard";

import {
  getRecipeById,
  getRelatedRecipes,
  getReviews,
  saveReview,
  deleteRecipe,
} from "../api/recipeApi";
import { useAuth } from "../context/AuthContext";
import CookMode from "../components/CookMode";


function RecipeDetails() {

  const { id } = useParams();

  const navigate = useNavigate();
  const { isAuthenticated, user, favoriteIds, toggleFavorite } = useAuth();


  // =====================================
  // STATE
  // =====================================

  const [recipe, setRecipe] = useState(null);

  const [relatedRecipes, setRelatedRecipes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  const [showCookMode, setShowCookMode] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [isSavingReview, setIsSavingReview] = useState(false);
  const isOwner = Boolean(
    isAuthenticated &&
    recipe?.createdBy &&
    String(recipe.createdBy._id || recipe.createdBy) === String(user?._id)
  );


  // =====================================
  // FETCH RECIPE
  // =====================================

  useEffect(() => {

    const fetchRecipe = async () => {

      try {

        setLoading(true);

        setError("");

        console.log(
          "Fetching recipe with ID:",
          id
        );


        // ---------------------------------
        // GET CURRENT RECIPE
        // ---------------------------------

        const response =
          await getRecipeById(id);


        console.log(
          "Recipe Details API response:",
          response
        );


        if (
          response?.success &&
          response?.recipe
        ) {

          const currentRecipe =
            response.recipe;

          setRecipe(currentRecipe);

          try {
            setReviewsLoading(true);
            const reviewsResponse = await getReviews(id);
            setReviews(reviewsResponse?.reviews || []);
          } catch {
            setReviewError("We couldn't load reviews right now.");
          } finally {
            setReviewsLoading(false);
          }


          // ---------------------------------
          // GET ALL RECIPES
          // ---------------------------------

          try {

            const allResponse =
              await getRelatedRecipes(id);


            console.log(
              "All Recipes API response:",
              allResponse
            );


            setRelatedRecipes(allResponse?.recipes || []);

          } catch (relatedError) {

            console.error(
              "Failed to fetch related recipes:",
              relatedError
            );

            setRelatedRecipes([]);

          }

        } else {

          console.error(
            "Recipe was not found in API response"
          );

          setRecipe(null);

          setError(
            "Recipe not found."
          );

        }

      } catch (error) {

        console.error(
          "Failed to fetch recipe:",
          error
        );

        setRecipe(null);

        setError(
          error?.response?.data?.message ||
          "Unable to load this recipe."
        );

      } finally {

        setLoading(false);

      }

    };


    if (id) {

      fetchRecipe();

    }

  }, [id]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/recipes/${id}` } });
      return;
    }
    try {
      setFavoriteError("");
      setIsTogglingFavorite(true);
      await toggleFavorite(recipe._id);
    } catch (requestError) {
      setFavoriteError(requestError.message || "Unable to update saved recipes.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/recipes/${id}` } });
      return;
    }
    if (!reviewForm.rating) {
      setReviewError("Please choose a star rating.");
      return;
    }
    try {
      setIsSavingReview(true);
      setReviewError("");
      const response = await saveReview(id, reviewForm);
      setRecipe(response.recipe);
      setReviews((current) => {
        const exists = current.some((review) => review._id === response.review._id);
        return exists ? current.map((review) => review._id === response.review._id ? response.review : review) : [response.review, ...current];
      });
      setReviewForm({ rating: 0, comment: "" });
    } catch (requestError) {
      setReviewError(requestError?.response?.data?.message || "Unable to save your review.");
    } finally {
      setIsSavingReview(false);
    }
  };


  // =====================================
  // OPEN DELETE CONFIRMATION
  // =====================================

  const handleDeleteClick = () => {

    setDeleteError("");

    setShowDeleteModal(true);

  };


  // =====================================
  // CLOSE DELETE CONFIRMATION
  // =====================================

  const handleCloseDeleteModal = () => {

    if (isDeleting) {
      return;
    }

    setShowDeleteModal(false);

    setDeleteError("");

  };


  // =====================================
  // DELETE RECIPE
  // =====================================

  const handleDeleteRecipe = async () => {

    try {

      setIsDeleting(true);

      setDeleteError("");


      console.log(
        "Deleting recipe:",
        id
      );


      const response =
        await deleteRecipe(id);


      console.log(
        "Delete Recipe API response:",
        response
      );


      if (response?.success) {

        console.log(
          "Recipe deleted successfully"
        );


        // Close modal
        setShowDeleteModal(false);


        // Navigate back to recipes
        navigate("/recipes", {
          replace: true,
        });


        return;

      }


      setDeleteError(
        response?.message ||
        "Failed to delete recipe. Please try again."
      );

    } catch (error) {

      console.error(
        "Failed to delete recipe:",
        error
      );


      setDeleteError(
        error?.response?.data?.message ||
        "Something went wrong while deleting the recipe."
      );

    } finally {

      setIsDeleting(false);

    }

  };


  // =====================================
  // LOADING STATE
  // =====================================

  if (loading) {

    return (

      <div className="app">

        <Navbar />

        <main className="not-found">

          <div className="empty-icon">
            🍳
          </div>

          <h1>
            Loading recipe...
          </h1>

          <p>
            Getting the recipe ready for you.
          </p>

        </main>

        <Footer />

      </div>

    );

  }


  // =====================================
  // RECIPE NOT FOUND / ERROR
  // =====================================

  if (!recipe) {

    return (

      <div className="app">

        <Navbar />

        <main className="not-found">

          <div className="empty-icon">
            🍽️
          </div>

          <h1>
            Recipe not found
          </h1>

          <p>
            {error ||
              "We couldn't find the recipe you're looking for."}
          </p>

          <Link
            to="/recipes"
            className="primary-btn"
          >
            Explore recipes
          </Link>

        </main>

        <Footer />

      </div>

    );

  }


  // =====================================
  // PAGE
  // =====================================

  return (

    <div className="app">

      <Navbar />


      <main className="recipe-details-page">


        {/* =====================================
            BACK BUTTON
        ====================================== */}

        <div className="details-container">

          <Link
            to="/recipes"
            className="back-link"
          >

            <ArrowLeft
              size={17}
            />

            Back to recipes

          </Link>

        </div>


        {/* =====================================
            RECIPE HERO
        ====================================== */}

        <section className="recipe-detail-hero">


          {/* IMAGE */}

          <div className="detail-image">

            <img
              src={
                recipe.image ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
              }
              alt={recipe.title}
              onError={(event) => {

                event.currentTarget.src =
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";

              }}
            />

          </div>


          {/* RECIPE INFORMATION */}

          <div className="detail-info">


            {/* CATEGORY */}

            <span className="recipe-detail-category">

              {recipe.category ||
                "Recipe"}

            </span>


            {/* TITLE */}

            <h1>

              {recipe.title}

            </h1>


            {/* DESCRIPTION */}

            <p className="detail-description">

              {recipe.description ||
                "A delicious recipe from the Savorly community."}

            </p>


            {/* RATING */}

            <div className="rating-row">

              <div className="stars">

                <Star
                  size={18}
                  fill="currentColor"
                />

                <strong>

                  {recipe.rating ?? 0}

                </strong>

              </div>


              <span>

                {recipe.reviews ?? 0} reviews

              </span>

            </div>


            {/* =================================
                RECIPE STATS
            ================================== */}

            <div className="detail-stats">


              {/* PREP TIME */}

              <span>

                <strong>

                  {recipe.prepTime || 0} min

                </strong>

                Prep

              </span>


              {/* COOK TIME */}

              <span>

                <strong>

                  {recipe.cookTime || 0} min

                </strong>

                Cook

              </span>


              {/* SERVINGS */}

              <span>

                <strong>

                  {recipe.servings || 0}

                </strong>

                Servings

              </span>


              {/* DIFFICULTY */}

              <span>

                <strong>

                  {recipe.difficulty ||
                    "Easy"}

                </strong>

                Difficulty

              </span>


            </div>


            {/* =================================
                ACTIONS
            ================================== */}

            <div className="detail-actions">


              {/* LISTEN BUTTON */}

              <button
                type="button"
                className="listen-btn"
                onClick={() => setShowCookMode(true)}
              >

                <span className="listen-icon">
                  ▶
                </span>

                Listen & Cook

              </button>


              {/* EDIT RECIPE */}

              {isOwner && <Link
                  to={`/recipes/${recipe._id}/edit`}
                  className="edit-recipe-btn"
                >
                  Edit Recipe
                </Link>}


              {/* DELETE RECIPE */}

              {isOwner && <button
                type="button"
                className="delete-recipe-btn"
                onClick={handleDeleteClick}
              >

                <Trash2
                  size={18}
                />

                Delete

              </button>}


              {/* SAVE BUTTON */}

              <button
                type="button"
                className="save-recipe-btn"
                aria-label={favoriteIds.includes(String(recipe._id)) ? "Remove from saved recipes" : "Save recipe"}
                aria-pressed={favoriteIds.includes(String(recipe._id))}
                disabled={isTogglingFavorite}
                onClick={handleFavorite}
              >

                <Heart
                  size={19}
                  fill={favoriteIds.includes(String(recipe._id)) ? "currentColor" : "none"}
                />

              </button>

            </div>

            {favoriteError && <p className="card-inline-error" role="alert">{favoriteError}</p>}


            {/* AUTHOR */}

            <p className="recipe-author">

              Recipe by{" "}

              <strong>

                {recipe.author ||
                  "Savorly Community"}

              </strong>

            </p>


          </div>

        </section>


        {/* =====================================
            RECIPE BODY
        ====================================== */}

        <section className="recipe-body">


          {/* =================================
              INGREDIENTS
          ================================== */}

          <div className="ingredients-section">


            <div className="body-heading">

              <span className="eyebrow">

                WHAT YOU NEED

              </span>

              <h2>

                Ingredients

              </h2>

            </div>


            <div className="ingredients-list">


              {Array.isArray(
                recipe.ingredients
              ) &&
              recipe.ingredients.length > 0 ? (

                recipe.ingredients.map(
                  (ingredient, index) => (

                    <div
                      className="ingredient-item"
                      key={index}
                    >

                      <span className="ingredient-check">

                        <Check
                          size={15}
                        />

                      </span>

                      <span>

                        {ingredient}

                      </span>

                    </div>

                  )
                )

              ) : (

                <p>
                  No ingredients available.
                </p>

              )}

            </div>

          </div>


          {/* =================================
              INSTRUCTIONS
          ================================== */}

          <div className="instructions-section">


            <div className="body-heading">

              <span className="eyebrow">

                LET'S GET COOKING

              </span>

              <h2>

                Instructions

              </h2>

            </div>


            <div className="instructions-list">


              {Array.isArray(
                recipe.instructions
              ) &&
              recipe.instructions.length > 0 ? (

                recipe.instructions.map(
                  (instruction, index) => (

                    <div
                      className="instruction-item"
                      key={index}
                    >

                      <div className="step-number">

                        {index + 1}

                      </div>

                      <p>

                        {instruction}

                      </p>

                    </div>

                  )
                )

              ) : (

                <p>
                  No instructions available.
                </p>

              )}

            </div>

          </div>


        </section>

        <section className="reviews-section" aria-labelledby="reviews-title">
          <div className="body-heading">
            <span className="eyebrow">FROM THE COMMUNITY</span>
            <h2 id="reviews-title">Ratings & reviews</h2>
          </div>

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <div>
              <p className="review-label">Your rating</p>
              <div className="review-stars" role="radiogroup" aria-label="Choose a rating">
                {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" role="radio" aria-checked={reviewForm.rating === rating} aria-label={`${rating} star${rating > 1 ? "s" : ""}`} onClick={() => setReviewForm((form) => ({ ...form, rating }))}><Star fill={rating <= reviewForm.rating ? "currentColor" : "none"} /></button>)}
              </div>
            </div>
            <label>Your review<textarea value={reviewForm.comment} maxLength="1000" placeholder="What did you enjoy about this recipe?" onChange={(event) => setReviewForm((form) => ({ ...form, comment: event.target.value }))} /></label>
            {reviewError && <p className="review-error" role="alert">{reviewError}</p>}
            <button className="review-submit" type="submit" disabled={isSavingReview}>{isSavingReview ? "Saving…" : isAuthenticated ? "Submit review" : "Sign in to review"}</button>
          </form>

          {reviewsLoading && <p className="reviews-status">Loading reviews…</p>}
          {!reviewsLoading && !reviewError && reviews.length === 0 && <p className="reviews-status">No reviews yet. Be the first to share your cooking experience.</p>}
          {!reviewsLoading && reviews.length > 0 && <div className="review-list">{reviews.map((review) => <article className="review-item" key={review._id}><div><strong>{review.user?.name || "Savorly cook"}</strong><span>{new Date(review.updatedAt).toLocaleDateString()}</span></div><div className="review-item-stars" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((rating) => <Star key={rating} size={15} fill={rating <= review.rating ? "currentColor" : "none"} />)}</div>{review.comment && <p>{review.comment}</p>}</article>)}</div>}
        </section>


        {/* =====================================
            RELATED RECIPES
        ====================================== */}

        {relatedRecipes.length > 0 && (

          <section className="related-recipes">


            <div className="related-heading">

              <div>

                <span className="eyebrow">

                  YOU MAY ALSO LIKE

                </span>

                <h2>

                  More recipes to try

                </h2>

              </div>


              <Link
                to="/recipes"
                className="text-btn"
              >

                Explore all →

              </Link>

            </div>


            <div className="recipe-grid">

              {relatedRecipes.map(
                (item) => (

                  <RecipeCard
                    key={
                      item._id ||
                      item.id
                    }
                    recipe={item}
                  />

                )
              )}

            </div>


          </section>

        )}


      </main>


      {/* =====================================
          DELETE CONFIRMATION MODAL
      ====================================== */}

      {showDeleteModal && (

        <div
          className="delete-modal-overlay"
          onClick={handleCloseDeleteModal}
        >

          <div
            className="delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="delete-modal-close"
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
              aria-label="Close"
            >

              <X size={20} />

            </button>


            {/* ICON */}

            <div className="delete-modal-icon">

              <Trash2 size={26} />

            </div>


            {/* CONTENT */}

            <h2>
              Delete this recipe?
            </h2>

            <p>

              Are you sure you want to delete{" "}

              <strong>
                "{recipe.title}"
              </strong>

              ? This action cannot be undone.

            </p>


            {/* ERROR */}

            {deleteError && (

              <div className="delete-modal-error">

                {deleteError}

              </div>

            )}


            {/* ACTIONS */}

            <div className="delete-modal-actions">

              <button
                type="button"
                className="delete-cancel-btn"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >

                Cancel

              </button>


              <button
                type="button"
                className="delete-confirm-btn"
                onClick={handleDeleteRecipe}
                disabled={isDeleting}
              >

                {isDeleting
                  ? "Deleting..."
                  : "Yes, delete recipe"}

              </button>

            </div>

          </div>

        </div>

      )}


      <Footer />

      {showCookMode && <CookMode recipe={recipe} onClose={() => setShowCookMode(false)} />}

    </div>

  );

}


export default RecipeDetails;
