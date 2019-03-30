const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const config = require("config");
const jwt = require("jsonwebtoken");

// Item Model
const User = require("../../models/User");

// @route post api/users
// @desc Register
// @access Public
router.post("/", (req, res) => {
  const { name, email, password, score } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  //  Check for existing user
  User.findOne({ email }).then(user => {
    if (user) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({
      name,
      email,
      password,
      score
    });

    // Create salt & hash
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then(user => {
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
  });
});

module.exports = router;
