const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");

router.post("/login", login);

// Protected route example
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Secure profile data",
    user: req.user, // from JWT
  });
});

module.exports = router;
