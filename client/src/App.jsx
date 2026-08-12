import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import RecipeExplorer from "./pages/RecipeExplorer";
import RecipeDetails from "./pages/RecipeDetails";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Favorites from "./pages/Favorites";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />


        {/* ALL RECIPES */}
        <Route
          path="/recipes"
          element={<RecipeExplorer />}
        />


        {/* RECIPE DETAILS */}
        <Route
          path="/recipes/:id"
          element={<RecipeDetails />}
        />


        {/* EDIT RECIPE */}
        <Route
  path="/recipes/:id/edit"
  element={<RequireAuth><EditRecipe /></RequireAuth>}
        />


        {/* CATEGORY */}
        <Route
          path="/category/:category"
          element={<RecipeExplorer />}
        />


        {/* ADD RECIPE */}
        <Route
  path="/add-recipe"
  element={<RequireAuth><AddRecipe /></RequireAuth>}
        />

        <Route
  path="/register"
  element={<Register />}
/>

<Route
  path="/login"
  element={<Login />}
/>
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

        <Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>

        <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
