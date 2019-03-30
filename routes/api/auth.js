const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const config = require("config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

// Item Model
const User = require("../../models/User");

// @route post api/auth
// @desc Auth user
// @access Public
router.post("/", (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  //  Check for existing user
  User.findOne({ email }).then(user => {
    if (!user) return res.status(400).json({ msg: "User does not exists" });

    // Validate password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      jwt.sign(
        // payload
        { id: user.id },
        config.get("jwtSecret"),
        { expiresIn: 1800 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              score: user.score
            }
          });
        }
      );
    });
  });
});

// @route Get api/auth/user
// @desc Get user data
// @access Private
router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then(user => res.json(user));
});

// @route put api/auth/score/:id
// @desc put item
// @access Private
router.put("/score/:id", auth, (req, res) => {
  const conditions = { _id: req.params.id };
  User.updateOne(conditions, req.body)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(404).json(err));
});

module.exports = router;
