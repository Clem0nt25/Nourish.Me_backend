const bcryptjs = require("bcryptjs");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
// const { isAuthenticated } = require("../middleware/jwt.middleware");

const router = require("express").Router();

// ******* SIGNUP ROUTE *******
router.post("/signup", async (req, res) => {
  const salt = bcryptjs.genSaltSync(13);
  const passwordHash = bcryptjs.hashSync(req.body.password, salt);
  try {
    await User.create({ email: req.body.email, password: passwordHash });
    res.status(201).json({ message: "New user created" });
  } catch (error) {
    console.log(error);
  }
});

// ******* LOGIN ROUTE *******
router.post("/login", async (req, res) => {
  const potentialUser = await User.findOne({ email: req.body.email });
  if (potentialUser) {
    if (bcryptjs.compareSync(req.body.password, potentialUser.password)) {
      const authToken = jwt.sign(
        { userId: potentialUser._id },
        process.env.TOKEN_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "6h",
        }
      );
      res.json({ message: "Login successful", token: authToken });
    } else {
      res.json({ message: "Incorrect password" });
    }
  } else {
    res.json({ message: "User doesn't exist" });
  }
});

// ******* VERIFY ROUTE *******
router.get("/verify", async (req, res) => {
  // isAuthenticated later
  const user = await User.findById(req.body.userId);
  res.status(200).json({ message: "User is authenticated", user });
});

module.exports = router;
