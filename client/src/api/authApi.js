import { API_BASE_URL } from "./client";

const API_URL = `${API_BASE_URL}/auth`;

// =====================================
// REGISTER
// =====================================

export const registerUser = async (userData) => {
  const response = await fetch(
    `${API_URL}/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to create account"
    );
  }

  return data;
};


// =====================================
// LOGIN
// =====================================

export const loginUser = async (
  credentials
) => {
  const response = await fetch(
    `${API_URL}/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(credentials),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to login"
    );
  }

  return data;
};


// =====================================
// GET CURRENT USER
// =====================================

export const getCurrentUser = async (
  token
) => {
  const response = await fetch(
    `${API_URL}/me`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to get user"
    );
  }

  return data;
};


// =====================================
// TOGGLE FAVORITE
// =====================================

export const toggleFavorite = async (
  recipeId,
  token
) => {
  const response = await fetch(
    `${API_URL}/favorites/${recipeId}`,
    {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update favorite"
    );
  }

  return data;
};


// =====================================
// GET MY FAVORITES
// =====================================

export const getFavorites = async (
  token
) => {
  const response = await fetch(
    `${API_URL}/favorites`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch favorites"
    );
  }

  return data;
};
