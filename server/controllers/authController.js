const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const Recipe = require("../models/Recipe");

// =====================================
// EMAIL TRANSPORTER
// =====================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =====================================
// CREATE JWT TOKEN
// =====================================

const createToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =====================================
// REGISTER USER
// =====================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // -----------------------------
    // CHECK EXISTING USER
    // -----------------------------

    const existingUser =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // -----------------------------
    // HASH PASSWORD
    // -----------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // -----------------------------
    // CREATE USER
    // -----------------------------

    const user = await User.create({
      name: name.trim(),

      email: email.toLowerCase().trim(),

      password: hashedPassword,

      favorites: [],
    });

    // -----------------------------
    // CREATE TOKEN
    // -----------------------------

    const token =
      createToken(user._id);

    // -----------------------------
    // RESPONSE
    // -----------------------------

    res.status(201).json({
      success: true,
      message:
        "Account created successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.error(
      "Register error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create account",
      error: error.message,
    });
  }
};

// =====================================
// LOGIN USER
// =====================================

const loginUser = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // -----------------------------
    // FIND USER
    // -----------------------------

    const user =
      await User.findOne({
        email: email.toLowerCase().trim(),
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -----------------------------
    // CHECK PASSWORD
    // -----------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -----------------------------
    // CREATE TOKEN
    // -----------------------------

    const token =
      createToken(user._id);

    // -----------------------------
    // RESPONSE
    // -----------------------------

    res.status(200).json({
      success: true,
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to login",
      error: error.message,
    });
  }
};

// =====================================
// FORGOT PASSWORD
// =====================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // ---------------------------------
    // VALIDATION
    // ---------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ---------------------------------
    // FIND USER
    // ---------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // ---------------------------------
    // SECURITY
    // ---------------------------------

    // Don't reveal whether an email exists.
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // ---------------------------------
    // CREATE RESET TOKEN
    // ---------------------------------

    const resetToken = crypto.randomBytes(32).toString("hex");

    // ---------------------------------
    // HASH TOKEN BEFORE SAVING
    // ---------------------------------

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Token valid for 15 minutes
    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // ---------------------------------
    // RESET URL
    // ---------------------------------

    const resetUrl =
  `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // ---------------------------------
    // EMAIL
    // ---------------------------------

    const mailOptions = {
      from: `"Savorly" <${process.env.EMAIL_USER}>`,

      to: user.email,

      subject: "Reset your Savorly password",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 40px;
          background: #fcfaf6;
          color: #292521;
        ">

          <div style="
            text-align: center;
            margin-bottom: 30px;
          ">

            <div style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 45px;
              height: 45px;
              background: #e86f45;
              color: white;
              border-radius: 12px;
              font-size: 22px;
              font-weight: bold;
            ">
              S
            </div>

            <h1 style="
              margin-top: 15px;
              font-family: Georgia, serif;
            ">
              Savorly
            </h1>

          </div>

          <div style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            border: 1px solid #ebe4db;
          ">

            <h2>
              Reset your password
            </h2>

            <p style="
              color: #706a64;
              line-height: 1.7;
            ">
              We received a request to reset the password
              for your Savorly account.
            </p>

            <p style="
              color: #706a64;
              line-height: 1.7;
            ">
              Click the button below to create a new password.
            </p>

            <div style="
              text-align: center;
              margin: 30px 0;
            ">

              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 14px 24px;
                  background: #e86f45;
                  color: white;
                  text-decoration: none;
                  border-radius: 100px;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>

            </div>

            <p style="
              color: #88817a;
              font-size: 13px;
              line-height: 1.6;
            ">
              This link will expire in 15 minutes.
            </p>

            <p style="
              color: #88817a;
              font-size: 13px;
              line-height: 1.6;
            ">
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

          </div>

          <p style="
            text-align: center;
            color: #99918a;
            font-size: 12px;
            margin-top: 25px;
          ">
            © Savorly
          </p>

        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // ---------------------------------
    // RESPONSE
    // ---------------------------------

    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request",
    });
  }
};

// =====================================
// RESET PASSWORD
// =====================================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // ---------------------------------
    // VALIDATION
    // ---------------------------------

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset link",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter a new password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // ---------------------------------
    // HASH TOKEN
    // ---------------------------------

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // ---------------------------------
    // FIND USER
    // ---------------------------------

    const user = await User.findOne({
      resetPasswordToken: hashedToken,

      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    // ---------------------------------
    // INVALID / EXPIRED TOKEN
    // ---------------------------------

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset link is invalid or has expired",
      });
    }

    // ---------------------------------
    // HASH NEW PASSWORD
    // ---------------------------------

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // ---------------------------------
    // UPDATE PASSWORD
    // ---------------------------------

    user.password = hashedPassword;

    // ---------------------------------
    // REMOVE RESET TOKEN
    // ---------------------------------

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // ---------------------------------
    // RESPONSE
    // ---------------------------------

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to reset password",
    });
  }
};

// =====================================
// GET CURRENT USER
// =====================================

const getMe = async (req, res) => {
  try {

    const user =
      await User.findById(
        req.user.userId
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(
      "Get user error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get user",
      error: error.message,
    });
  }
};

// =====================================
// ADD / REMOVE FAVORITE
// =====================================

const toggleFavorite = async (
  req,
  res
) => {
  try {

    const {
      recipeId,
    } = req.params;

    // -----------------------------
    // CHECK RECIPE
    // -----------------------------

    const recipe =
      await Recipe.findById(
        recipeId
      );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message:
          "Recipe not found",
      });
    }

    // -----------------------------
    // FIND USER
    // -----------------------------

    const user =
      await User.findById(
        req.user.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // -----------------------------
    // CHECK FAVORITE
    // -----------------------------

    const favoriteIndex =
      user.favorites.findIndex(
        (id) =>
          id.toString() ===
          recipeId
      );

    // -----------------------------
    // REMOVE FAVORITE
    // -----------------------------

    if (favoriteIndex !== -1) {

      user.favorites.splice(
        favoriteIndex,
        1
      );

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Recipe removed from favorites",

        isFavorite: false,
      });
    }

    // -----------------------------
    // ADD FAVORITE
    // -----------------------------

    user.favorites.push(
      recipeId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Recipe added to favorites",

      isFavorite: true,
    });

  } catch (error) {

    console.error(
      "Toggle favorite error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update favorite",
      error: error.message,
    });
  }
};

// =====================================
// GET MY FAVORITES
// =====================================

const getFavorites = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.user.userId
      )
      .select("favorites")
      .populate("favorites");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    res.status(200).json({
      success: true,

      count:
        user.favorites.length,

      recipes:
        user.favorites,
    });

  } catch (error) {

    console.error(
      "Get favorites error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch favorites",
      error: error.message,
    });
  }
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  toggleFavorite,
  getFavorites,
};