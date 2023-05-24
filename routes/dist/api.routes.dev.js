"use strict";

var router = require("express").Router();

var _require = require("../middleware/jwt.middleware"),
    isAuthenticated = _require.isAuthenticated;

var _require2 = require("../models/Meal.model"),
    Meal = _require2.Meal;

var _require3 = require("../models/Food.model"),
    Food = _require3.Food;

var UserSpecsHistory = require("../models/UserSpecsHistory.model");

var axios = require("axios");

var mongoose = require("mongoose");

var User = require("../models/User.model");

var UserSpecsCurrent = require("../models/UserSpecsCurrent.model"); // search route


router.post("/getFood", function _callee(req, res) {
  var foodName, apiData, allProdcuts, foodData, i, name, food;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(req.body);
          _context.prev = 1;
          foodName = req.body.foodName; // make api call

          _context.next = 5;
          return regeneratorRuntime.awrap(axios.get("https://world.openfoodfacts.org/cgi/search.pl?search_terms=".concat(foodName, "&search_simple=1&action=process&json=1&page_size=1")));

        case 5:
          apiData = _context.sent;
          allProdcuts = apiData.data.products; // for loop over the first 10 products and save it to an object

          foodData = [];

          for (i = 0; i < 10; i++) {
            name = allProdcuts[i].product_name || allProdcuts[i].brands;
            food = {
              foodName: name,
              image: allProdcuts[i].image_front_small_url,
              barcode: allProdcuts[i]._id
            };
            foodData.push(food);
          }

          console.log(foodData); // return api data to frontend

          res.status(200).json({
            message: "Food data retrieved",
            data: foodData
          });
          _context.next = 17;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](1);
          console.error(_context.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context.t0
          });

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 13]]);
}); // make second route to call api by barcode received from frontend { barcode: 123456789, amount: 100 }

router.post("/getFoodByBarcode", function _callee2(req, res) {
  var _req$body, currentDate, barcode, amount, mealType, userId, _id, apiData, product, name, meal, mealId, newMeal, updatedMeal, productData, newFood;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body = req.body, currentDate = _req$body.currentDate, barcode = _req$body.barcode, amount = _req$body.amount, mealType = _req$body.mealType, userId = _req$body.userId, _id = _req$body._id;
          _context2.next = 4;
          return regeneratorRuntime.awrap(axios.get("https://world.openfoodfacts.org/api/v0/product/".concat(barcode, ".json")));

        case 4:
          apiData = _context2.sent;
          product = apiData.data.product;
          name = product.product_name || product.brands;
          _context2.next = 9;
          return regeneratorRuntime.awrap(Meal.findOne({
            userId: userId,
            date: currentDate,
            category: mealType
          }));

        case 9:
          meal = _context2.sent;

          if (meal) {
            _context2.next = 17;
            break;
          }

          _context2.next = 13;
          return regeneratorRuntime.awrap(Meal.create({
            food: [barcode],
            userId: userId,
            category: mealType,
            date: currentDate
          }));

        case 13:
          newMeal = _context2.sent;
          mealId = newMeal._id;
          _context2.next = 21;
          break;

        case 17:
          _context2.next = 19;
          return regeneratorRuntime.awrap(Meal.findOneAndUpdate({
            userId: userId,
            date: currentDate,
            category: mealType
          }, {
            $push: {
              food: barcode
            }
          }, {
            "new": true
          }));

        case 19:
          updatedMeal = _context2.sent;
          mealId = updatedMeal._id;

        case 21:
          productData = {
            foodName: name,
            barcode: barcode,
            calories: product.nutriments["energy-kcal_100g"] / 100 * amount || 0,
            protein: product.nutriments.proteins_100g / 100 * amount || 0,
            fiber: product.nutriments.fiber_100g / 100 * amount || 0,
            carbs: product.nutriments.carbohydrates_100g / 100 * amount || 0,
            fat: product.nutriments.fat_100g / 100 * amount || 0,
            amount: amount,
            date: currentDate,
            mealId: mealId
          };

          if (!_id) {
            _context2.next = 29;
            break;
          }

          _context2.next = 25;
          return regeneratorRuntime.awrap(Food.findByIdAndUpdate(_id, productData, {
            "new": true
          }));

        case 25:
          newFood = _context2.sent;
          console.log("Updated food item:", newFood);
          _context2.next = 33;
          break;

        case 29:
          _context2.next = 31;
          return regeneratorRuntime.awrap(Food.create(productData));

        case 31:
          newFood = _context2.sent;
          console.log("Created new food item:", newFood);

        case 33:
          res.status(200).json({
            message: "Product data retrieved",
            data: newFood,
            objectId: newFood._id
          });
          _context2.next = 40;
          break;

        case 36:
          _context2.prev = 36;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context2.t0
          });

        case 40:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 36]]);
}); // Get meals and specific food data for each meal

router.get("/getUserDiary", function _callee4(req, res) {
  var _req$query, userId, date, meals, mealData, diary;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$query = req.query, userId = _req$query.userId, date = _req$query.date; // Query database for all meals that match the userId and date

          _context4.next = 3;
          return regeneratorRuntime.awrap(Meal.find({
            userId: userId,
            date: date
          }));

        case 3:
          meals = _context4.sent;
          _context4.next = 6;
          return regeneratorRuntime.awrap(Promise.all(meals.map(function _callee3(meal) {
            var foods;
            return regeneratorRuntime.async(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return regeneratorRuntime.awrap(Food.find({
                      mealId: meal._id
                    }));

                  case 2:
                    foods = _context3.sent;
                    return _context3.abrupt("return", {
                      mealId: meal._id,
                      mealType: meal.category,
                      foods: foods
                    });

                  case 4:
                  case "end":
                    return _context3.stop();
                }
              }
            });
          })));

        case 6:
          mealData = _context4.sent;
          diary = {
            breakfast: mealData.find(function (meal) {
              return meal.mealType === "breakfast";
            }),
            lunch: mealData.find(function (meal) {
              return meal.mealType === "lunch";
            }),
            dinner: mealData.find(function (meal) {
              return meal.mealType === "dinner";
            }),
            snack: mealData.find(function (meal) {
              return meal.mealType === "snack";
            })
          };
          res.status(200).json(diary);

        case 9:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // simple route that checks if user already has a UserSpecs document in the database

router.post("/createUserSpecsCurrent/:id", function _callee5(req, res) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(UserSpecsCurrent.create(req.body));

        case 3:
          res.status(201).json({
            message: "User specs current created"
          });
          _context5.next = 10;
          break;

        case 6:
          _context5.prev = 6;
          _context5.t0 = _context5["catch"](0);
          console.error(_context5.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context5.t0
          });

        case 10:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 6]]);
}); //route that get the UserSpecsCurrent document in the database

router.get("/checkUserSpecs/:id", function _callee6(req, res) {
  var userSpecs;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          console.log("hello");
          _context6.prev = 1;
          _context6.next = 4;
          return regeneratorRuntime.awrap(UserSpecsCurrent.findOne({
            userId: req.params.id
          }));

        case 4:
          userSpecs = _context6.sent;

          if (userSpecs) {
            res.status(200).json({
              message: "User specs found",
              data: userSpecs
            });
          } else {
            res.status(404).json({
              message: "User specs not found"
            });
          }

          _context6.next = 12;
          break;

        case 8:
          _context6.prev = 8;
          _context6.t0 = _context6["catch"](1);
          console.error(_context6.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context6.t0
          });

        case 12:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[1, 8]]);
}); // create get route that checks if user already has userSpecHistory for the date, if not create it

router.get("/getUserHistory/:id", function _callee7(req, res) {
  var currentDate, userId, userSpecsHistory, meals, mealIds, foods, totalCalories, totalProtein, totalFiber, totalCarbs, userSpecsCurrent, userSpecsHistoryData, newUserSpecsHistory, _userSpecsCurrent, _meals, _mealIds, _foods, _totalCalories, _totalProtein, _totalFiber, _totalCarbs, _userSpecsHistoryData, updatedUserSpecsHistory;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          // get current date in format YYYY-MM-DD and userId from params
          currentDate = new Date().toISOString().slice(0, 10); // const userId = req.params.id;

          userId = "123456789";
          console.log(currentDate, userId);
          console.log(UserSpecsHistory); // check if current user already has a userSpecsHistory document for the current date

          _context7.next = 6;
          return regeneratorRuntime.awrap(UserSpecsHistory.findOne({
            userId: userId,
            date: currentDate
          }));

        case 6:
          userSpecsHistory = _context7.sent;

          if (userSpecsHistory) {
            _context7.next = 31;
            break;
          }

          _context7.next = 10;
          return regeneratorRuntime.awrap(Meal.find({
            date: currentDate,
            userId: userId
          }));

        case 10:
          meals = _context7.sent;
          // create array of mealIds
          mealIds = meals.map(function (meal) {
            return meal._id;
          });
          console.log(mealIds); // query Food Model for all food objects with mealIds from mealIds array

          _context7.next = 15;
          return regeneratorRuntime.awrap(Food.find({
            mealId: {
              $in: mealIds
            }
          }));

        case 15:
          foods = _context7.sent;
          console.log(foods); // map over foods array create new object where total calories, protein, fiber and carbs are calculated from all foods

          totalCalories = foods.reduce(function (acc, food) {
            return acc + food.calories;
          }, 0);
          totalProtein = foods.reduce(function (acc, food) {
            return acc + food.protein;
          }, 0);
          totalFiber = foods.reduce(function (acc, food) {
            return acc + food.fiber;
          }, 0);
          totalCarbs = foods.reduce(function (acc, food) {
            return acc + food.carbs;
          }, 0); // find latest UserSpecsCurrent document for current user by userid and latest date

          _context7.next = 23;
          return regeneratorRuntime.awrap(UserSpecsCurrent.findOne({
            userId: userId
          }).sort({
            date: -1
          }));

        case 23:
          userSpecsCurrent = _context7.sent;
          userSpecsHistoryData = {
            userId: userId,
            date: currentDate,
            currentCalories: totalCalories,
            currentProtein: totalProtein,
            currentFiber: totalFiber,
            currentCarbs: totalCarbs,
            activityLevel: userSpecsCurrent.activityLevel,
            currentWeight: userSpecsCurrent.currentWeight,
            goalCalories: userSpecsCurrent.goalCalories,
            goalProtein: userSpecsCurrent.goalProtein,
            goalFiber: userSpecsCurrent.goalFiber,
            goalCarbs: userSpecsCurrent.goalCarbs
          };
          console.log(userSpecsHistoryData); // create new UserSpecsHistory document with data from userSpecsHistoryData object

          _context7.next = 28;
          return regeneratorRuntime.awrap(UserSpecsHistory.create(userSpecsHistoryData));

        case 28:
          newUserSpecsHistory = _context7.sent;
          _context7.next = 51;
          break;

        case 31:
          _context7.next = 33;
          return regeneratorRuntime.awrap(UserSpecsCurrent.findOne({
            userId: userId
          }).sort({
            date: -1
          }));

        case 33:
          _userSpecsCurrent = _context7.sent;
          _context7.next = 36;
          return regeneratorRuntime.awrap(Meal.find({
            date: currentDate,
            userId: userId
          }));

        case 36:
          _meals = _context7.sent;
          // create array of mealIds
          _mealIds = _meals.map(function (meal) {
            return meal._id;
          });
          console.log(_mealIds); // query Food Model for all food objects with mealIds from mealIds array

          _context7.next = 41;
          return regeneratorRuntime.awrap(Food.find({
            mealId: {
              $in: _mealIds
            }
          }));

        case 41:
          _foods = _context7.sent;
          console.log(_foods); // map over foods array create new object where total calories, protein, fiber and carbs are calculated from all foods

          _totalCalories = _foods.reduce(function (acc, food) {
            return acc + food.calories;
          }, 0);
          _totalProtein = _foods.reduce(function (acc, food) {
            return acc + food.protein;
          }, 0);
          _totalFiber = _foods.reduce(function (acc, food) {
            return acc + food.fiber;
          }, 0);
          _totalCarbs = _foods.reduce(function (acc, food) {
            return acc + food.carbs;
          }, 0); // update userSpecsHistory document with new data

          _userSpecsHistoryData = {
            userId: userId,
            date: currentDate,
            currentCalories: _totalCalories,
            currentProtein: _totalProtein,
            currentFiber: _totalFiber,
            currentCarbs: _totalCarbs,
            activityLevel: _userSpecsCurrent.activityLevel,
            currentWeight: _userSpecsCurrent.currentWeight,
            goalCalories: _userSpecsCurrent.goalCalories,
            goalProtein: _userSpecsCurrent.goalProtein,
            goalFiber: _userSpecsCurrent.goalFiber,
            goalCarbs: _userSpecsCurrent.goalCarbs
          };
          _context7.next = 50;
          return regeneratorRuntime.awrap(UserSpecsHistory.findOneAndUpdate({
            userId: userId,
            date: currentDate
          }, {
            $set: _userSpecsHistoryData
          }, {
            "new": true
          }));

        case 50:
          updatedUserSpecsHistory = _context7.sent;

        case 51:
        case "end":
          return _context7.stop();
      }
    }
  });
});
module.exports = router;