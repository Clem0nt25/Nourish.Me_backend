"use strict";

var bcryptjs = require("bcryptjs");

var User = require("../models/User.model");

var jwt = require("jsonwebtoken");

var router = require("express").Router();

var _require = require("../middleware/jwt.middleware"),
    isAuthenticated = _require.isAuthenticated; // ******* SIGNUP ROUTE *******


router.post("/signup", function _callee(req, res) {
  var salt, passwordHash, newUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          salt = bcryptjs.genSaltSync(parseInt(process.env.SALT_ROUNDS) || 13);
          passwordHash = bcryptjs.hashSync(req.body.password, salt);
          _context.next = 5;
          return regeneratorRuntime.awrap(User.create({
            email: req.body.email,
            password: passwordHash
          }));

        case 5:
          newUser = _context.sent;
          res.status(201).json({
            message: "New user created",
            user: newUser._id
          });
          _context.next = 13;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context.t0
          });

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // ******* LOGIN ROUTE *******

router.post("/login", function _callee2(req, res) {
  var potentialUser, authToken;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 3:
          potentialUser = _context2.sent;

          if (potentialUser) {
            if (bcryptjs.compareSync(req.body.password, potentialUser.password)) {
              authToken = jwt.sign({
                userId: potentialUser._id
              }, process.env.TOKEN_SECRET, {
                algorithm: "HS256",
                expiresIn: "6h"
              });
              res.status(200).json({
                message: "Login successful",
                token: authToken
              });
            } else {
              res.status(401).json({
                message: "Incorrect password"
              });
            }
          } else {
            res.status(404).json({
              message: "User not found"
            });
          }

          _context2.next = 11;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context2.t0
          });

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // ******* VERIFY ROUTE *******

router.get("/verify/", isAuthenticated, function _callee3(req, res) {
  var user, userToReturn;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(User.findById(req.auth.userId));

        case 3:
          user = _context3.sent;

          if (user) {
            userToReturn = {
              _id: user._id,
              email: user.email // other NOT SENSITIVE data to reveal to client

            };
            res.status(200).json({
              message: "User is authenticated",
              user: userToReturn
            });
          } else {
            res.status(404).json({
              message: "User not found"
            });
          }

          _context3.next = 11;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context3.t0
          });

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
module.exports = router;