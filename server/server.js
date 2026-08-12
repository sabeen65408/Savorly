const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB =
  require("./config/db");

const recipeRoutes =
  require("./routes/recipeRoutes");

const authRoutes =
  require("./routes/authRoutes");

const app = express();

const PORT =
  process.env.PORT || 5000;

// =====================================
// CONNECT MONGODB
// =====================================

connectDB();

// =====================================
// MIDDLEWARE
// =====================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://savorly-ten.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(
  express.json()
);

// =====================================
// RECIPE ROUTES
// =====================================

app.use(
  "/api/recipes",
  recipeRoutes
);

// =====================================
// AUTH ROUTES
// =====================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================
// TEST ROUTE
// =====================================

app.get("/", (req, res) => {

  res.json({
    message:
      "Savorly API is running",
  });

});

// =====================================
// START SERVER
// =====================================

app.listen(
  PORT,
  () => {

    console.log(
      `Savorly server running on port ${PORT}`
    );

  }
);