import API from "./client";

export const getRecipes = async () => {
  const response = await API.get("/recipes");

  return response.data;
};

export const getRecipeById = async (id) => {
  const response = await API.get(`/recipes/${id}`);

  return response.data;
};

export const getRelatedRecipes = async (id) => {
  const response = await API.get(`/recipes/${id}/related`);

  return response.data;
};

export const translateRecipeToTamil = async (id) => {
  const response = await API.post(`/recipes/${id}/translate/tamil`);

  return response.data;
};

export const createRecipe = async (recipeData) => {
  const response = await API.post("/recipes", recipeData);

  return response.data;
};

export const updateRecipe = async (id, recipeData) => {
  const response = await API.put(
    `/recipes/${id}`,
    recipeData
  );

  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await API.delete(
    `/recipes/${id}`
  );

  return response.data;
};

export default API;
