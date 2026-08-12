import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";

import {
  getCurrentUser,
  getFavorites,
  loginUser,
  registerUser,
  toggleFavorite as toggleFavoriteRequest,
} from "../api/authApi";


// =====================================
// CREATE CONTEXT
// =====================================

const AuthContext =
  createContext(null);


// =====================================
// AUTH PROVIDER
// =====================================

export function AuthProvider({
  children,
}) {

  // ===================================
  // STATE
  // ===================================

  const [user, setUser] =
    useState(null);

  const [token, setToken] =
    useState(
      localStorage.getItem(
        "savorly_token"
      )
    );

  const [loading, setLoading] =
    useState(true);

  const [favoriteIds, setFavoriteIds] =
    useState([]);

  const [favoritesLoading, setFavoritesLoading] =
    useState(false);


  // ===================================
  // LOGOUT
  // ===================================

  const logout = () => {

    localStorage.removeItem(
      "savorly_token"
    );

    setToken(null);

    setUser(null);

    setFavoriteIds([]);

  };


  // ===================================
  // RESTORE LOGIN SESSION
  // ===================================

  useEffect(() => {

    const loadUser = async () => {

      if (!token) {

        setUser(null);

        setLoading(false);

        return;

      }


      try {

        const response =
          await getCurrentUser(
            token
          );


        if (
          response?.success &&
          response?.user
        ) {

          setUser(
            response.user
          );

          setFavoriteIds(
            (response.user.favorites || []).map((favorite) =>
              String(favorite._id || favorite)
            )
          );

        } else {

          logout();

        }

      } catch (error) {

        console.error(
          "Failed to restore user session:",
          error
        );

        logout();

      } finally {

        setLoading(false);

      }

    };


    loadUser();

  }, [token]);

  const refreshFavorites = useCallback(async () => {
    if (!token) {
      setFavoriteIds([]);
      return [];
    }

    setFavoritesLoading(true);

    try {
      const response = await getFavorites(token);
      const recipes = response?.favorites || response?.recipes || [];
      const ids = recipes.map((recipe) => String(recipe._id || recipe));

      setFavoriteIds(ids);
      return recipes;
    } finally {
      setFavoritesLoading(false);
    }
  }, [token]);

  const toggleFavorite = useCallback(async (recipeId) => {
    if (!token) {
      throw new Error("Please sign in to save recipes.");
    }

    const response = await toggleFavoriteRequest(recipeId, token);
    const id = String(recipeId);

    setFavoriteIds((current) => {
      if (response?.isFavorite) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((favoriteId) => favoriteId !== id);
    });

    return response;
  }, [token]);


  // ===================================
  // REGISTER
  // ===================================

  const register = async (
    userData
  ) => {

    const response =
      await registerUser(
        userData
      );


    if (
      response?.success &&
      response?.token &&
      response?.user
    ) {

      localStorage.setItem(
        "savorly_token",
        response.token
      );

      setToken(
        response.token
      );

      setUser(
        response.user
      );

      setFavoriteIds(
        (response.user.favorites || []).map((favorite) =>
          String(favorite._id || favorite)
        )
      );

    }


    return response;

  };


  // ===================================
  // LOGIN
  // ===================================

  const login = async (
    credentials
  ) => {

    const response =
      await loginUser(
        credentials
      );


    if (
      response?.success &&
      response?.token &&
      response?.user
    ) {

      localStorage.setItem(
        "savorly_token",
        response.token
      );

      setToken(
        response.token
      );

      setUser(
        response.user
      );

      setFavoriteIds(
        (response.user.favorites || []).map((favorite) =>
          String(favorite._id || favorite)
        )
      );

    }


    return response;

  };


  // ===================================
  // CONTEXT VALUE
  // ===================================

  const value = {

    user,

    token,

    loading,

    isAuthenticated:
      Boolean(user && token),

    register,

    login,

    logout,

    favoriteIds,

    favoritesLoading,

    refreshFavorites,

    toggleFavorite,

  };


  // ===================================
  // PROVIDER
  // ===================================

  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );

}


// =====================================
// CUSTOM HOOK
// =====================================

// This hook is intentionally exported beside its provider for the existing context API.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;

}
