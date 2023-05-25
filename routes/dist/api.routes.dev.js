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

var UserSpecsCurrent = require("../models/UserSpecsCurrent.model");

var moment = require("moment");

router.post("/getFood", isAuthenticated, function _callee(req, res) {
  var foodName, apiData, allProducts, foodData, i, name, food;
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
          allProducts = apiData.data.products; // for loop over the first 10 products and save it to an object

          foodData = [];

          for (i = 0; i < 10; i++) {
            name = allProducts[i].product_name || allProducts[i].brands;
            food = {
              foodName: name,
              image: allProducts[i].image_front_small_url,
              barcode: allProducts[i]._id,
              calories: allProducts[i].nutriments["energy-kcal_100g"],
              protein: allProducts[i].nutriments.proteins_100g,
              fiber: allProducts[i].nutriments.fiber_100g,
              carbs: allProducts[i].nutriments.carbohydrates_100g,
              fat: allProducts[i].nutriments.fat_100g
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
}); // Route to get just the food nutrition data by barcode

router.post("/api/getFoodInfoByBarcode", function _callee2(req, res) {
  var barcode, apiData, product, food;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          barcode = req.body.barcode; // make api call

          _context2.next = 4;
          return regeneratorRuntime.awrap(axios.get("https://world.openfoodfacts.org/api/v0/product/".concat(barcode, ".json")));

        case 4:
          apiData = _context2.sent;
          product = apiData.data.product; // Prepare the food data

          food = {
            foodName: product.product_name || product.brands,
            image: product.image_front_small_url,
            barcode: product._id,
            calories: product.nutriments["energy-kcal_100g"],
            protein: product.nutriments.proteins_100g,
            fiber: product.nutriments.fiber_100g,
            carbs: product.nutriments.carbohydrates_100g,
            fat: product.nutriments.fat_100g
          };
          console.log(food); // return api data to frontend

          res.status(200).json({
            message: "Food data retrieved",
            data: food
          });
          _context2.next = 15;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context2.t0
          });

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // make second route to call api by barcode received from frontend { barcode: 123456789, amount: 100 }

router.post("/getFoodByBarcode", isAuthenticated, function _callee3(req, res) {
  var _req$body, currentDate, barcode, amount, mealType, userId, apiData, product, name, meal, mealId, newMeal, updatedMeal, productData, food, newFood, updatedFood, allMeals, allMealIds, totalCalories, totalProtein, totalFiber, totalCarbs, totalFat, allFood, userSpecsCurrent, activityLevel, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber, userSpecsHistory, newUserSpecsHistory, updatedUserSpecsHistory;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _req$body = req.body, currentDate = _req$body.currentDate, barcode = _req$body.barcode, amount = _req$body.amount, mealType = _req$body.mealType, userId = _req$body.userId; // 1) make api call to retrieve food data from barcode

          _context3.next = 4;
          return regeneratorRuntime.awrap(axios.get("https://world.openfoodfacts.org/api/v0/product/".concat(barcode, ".json")));

        case 4:
          apiData = _context3.sent;
          product = apiData.data.product;
          name = product.product_name || product.brands; // 2) create meal object from barcode for food, userId, category from mealType a currentDate
          // first check if meal for this day already exists based on currentDate, userId and mealType

          _context3.next = 9;
          return regeneratorRuntime.awrap(Meal.findOne({
            userId: userId,
            date: currentDate,
            category: mealType
          }));

        case 9:
          meal = _context3.sent;

          if (meal) {
            _context3.next = 17;
            break;
          }

          _context3.next = 13;
          return regeneratorRuntime.awrap(Meal.create({
            food: [barcode],
            userId: userId,
            category: mealType,
            date: currentDate
          }));

        case 13:
          newMeal = _context3.sent;
          mealId = newMeal._id;
          _context3.next = 21;
          break;

        case 17:
          _context3.next = 19;
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
          updatedMeal = _context3.sent;
          mealId = updatedMeal._id;

        case 21:
          // 1.1) create food object from api data
          productData = {
            foodName: name,
            barcode: product._id,
            calories: product.nutriments["energy-kcal_100g"] / 100 * amount || 0,
            protein: product.nutriments.proteins_100g / 100 * amount || 0,
            fiber: product.nutriments.fiber_100g / 100 * amount || 0,
            carbs: product.nutriments.carbohydrates_100g / 100 * amount || 0,
            fat: product.nutriments.fat_100g / 100 * amount || 0,
            amount: amount,
            date: currentDate,
            mealId: mealId,
            image: product.image_front_small_url
          }; // 1.2) save food object to database with food model
          // check if food object based on barcode, date, and mealId already exists in database

          _context3.next = 24;
          return regeneratorRuntime.awrap(Food.findOne({
            mealId: mealId,
            barcode: barcode
          }));

        case 24:
          food = _context3.sent;

          if (food) {
            _context3.next = 31;
            break;
          }

          _context3.next = 28;
          return regeneratorRuntime.awrap(Food.create(productData));

        case 28:
          newFood = _context3.sent;
          _context3.next = 34;
          break;

        case 31:
          _context3.next = 33;
          return regeneratorRuntime.awrap(Food.findOneAndUpdate({
            barcode: barcode,
            date: currentDate,
            mealId: mealId
          }, {
            $set: {
              calories: productData.calories,
              protein: productData.protein,
              fiber: productData.fiber,
              carbs: productData.carbs,
              fat: productData.fat,
              amount: productData.amount
            }
          }, {
            "new": true
          }));

        case 33:
          updatedFood = _context3.sent;

        case 34:
          _context3.next = 36;
          return regeneratorRuntime.awrap(Meal.find({
            date: currentDate,
            userId: userId
          }));

        case 36:
          allMeals = _context3.sent;
          allMealIds = allMeals.map(function (meal) {
            return meal._id;
          });
          console.log(allMealIds); // add up all calories, protein, fiber, carbs, fat from all food objects

          totalCalories = 0;
          totalProtein = 0;
          totalFiber = 0;
          totalCarbs = 0;
          totalFat = 0; // get all food objects for all mealIds

          _context3.next = 46;
          return regeneratorRuntime.awrap(Food.find({
            mealId: {
              $in: allMealIds
            }
          }));

        case 46:
          allFood = _context3.sent;
          console.log(allFood);
          allFood.forEach(function (food) {
            totalCalories += food.calories;
            totalProtein += food.protein;
            totalFiber += food.fiber;
            totalCarbs += food.carbs;
            totalFat += food.fat;
          }); // 3) get activity level, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber from userSpecsCurrent by userId

          _context3.next = 51;
          return regeneratorRuntime.awrap(UserSpecsCurrent.findOne({
            userId: userId
          }));

        case 51:
          userSpecsCurrent = _context3.sent;
          // get activity level, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber from userSpecsCurrent variable
          activityLevel = userSpecsCurrent.activityLevel;
          currentWeight = userSpecsCurrent.currentWeight;
          goalCalories = userSpecsCurrent.goalCalories;
          goalProtein = userSpecsCurrent.goalProtein;
          goalCarbs = userSpecsCurrent.goalCarbs;
          goalFat = userSpecsCurrent.goalFat;
          goalFiber = userSpecsCurrent.goalFiber; // 4) check if user has a UserSpecshistory object for the current date

          _context3.next = 61;
          return regeneratorRuntime.awrap(UserSpecsHistory.findOne({
            userId: userId,
            date: currentDate
          }));

        case 61:
          userSpecsHistory = _context3.sent;

          if (userSpecsHistory) {
            _context3.next = 68;
            break;
          }

          _context3.next = 65;
          return regeneratorRuntime.awrap(UserSpecsHistory.create({
            activityLevel: activityLevel,
            currentWeight: parseFloat(currentWeight.toFixed(1)),
            currentCalories: parseFloat(totalCalories.toFixed(1)),
            goalCalories: goalCalories,
            currentProtein: parseFloat(totalProtein.toFixed(1)),
            goalProtein: goalProtein,
            currentCarbs: parseFloat(totalCarbs.toFixed(1)),
            goalCarbs: goalCarbs,
            currentFat: parseFloat(totalFat.toFixed(1)),
            goalFat: goalFat,
            currentFiber: parseFloat(totalFiber.toFixed(1)),
            goalFiber: goalFiber,
            date: currentDate,
            userId: userId
          }));

        case 65:
          newUserSpecsHistory = _context3.sent;
          _context3.next = 71;
          break;

        case 68:
          _context3.next = 70;
          return regeneratorRuntime.awrap(UserSpecsHistory.findOneAndUpdate({
            userId: userId,
            date: currentDate
          }, {
            activityLevel: activityLevel,
            currentWeight: parseFloat(currentWeight.toFixed(1)),
            currentCalories: parseFloat(totalCalories.toFixed(1)),
            goalCalories: goalCalories,
            currentProtein: parseFloat(totalProtein.toFixed(1)),
            goalProtein: goalProtein,
            currentCarbs: parseFloat(totalCarbs.toFixed(1)),
            goalCarbs: goalCarbs,
            currentFat: parseFloat(totalFat.toFixed(1)),
            goalFat: goalFat,
            currentFiber: parseFloat(totalFiber.toFixed(1)),
            goalFiber: goalFiber,
            date: currentDate,
            userId: userId
          }, {
            "new": true
          }));

        case 70:
          updatedUserSpecsHistory = _context3.sent;

        case 71:
          console.log("History updated"); // return api data to frontend

          console.log("Sending data to frontend");
          res.status(200).json({
            message: "Product data retrieved",
            data: productData
          });
          _context3.next = 80;
          break;

        case 76:
          _context3.prev = 76;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context3.t0
          });

        case 80:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 76]]);
}); // make get route that get UserSpecsHistory object for current date and userId (userId from params)

router.get("/userSpecsHistory/:userId", isAuthenticated, function _callee4(req, res) {
  var userId, currentDate, userSpecsHistory;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          userId = req.params.userId;
          currentDate = moment().format("YYYY-MM-DD");
          console.log(userId, currentDate); // get userSpecsHistory object for current date and userId

          _context4.next = 6;
          return regeneratorRuntime.awrap(UserSpecsHistory.findOne({
            userId: userId,
            date: currentDate
          }));

        case 6:
          userSpecsHistory = _context4.sent;
          console.log(userSpecsHistory);
          res.status(200).json({
            message: "UserSpecsHistory object retrieved",
            data: userSpecsHistory
          });
          _context4.next = 15;
          break;

        case 11:
          _context4.prev = 11;
          _context4.t0 = _context4["catch"](0);
          console.error(_context4.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context4.t0
          });

        case 15:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // make route that deletes food object from database based on currentDate, userId, Barcode, MealId

router.post("/deleteFood", isAuthenticated, function _callee5(req, res) {
  var _req$body2, userId, barcode, mealId, currentDate, deletedFood, allMeals, allMealIds, totalCalories, totalProtein, totalFiber, totalCarbs, totalFat, allFood, userSpecsCurrent, activityLevel, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber, updatedUserSpecsHistory;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _req$body2 = req.body, userId = _req$body2.userId, barcode = _req$body2.barcode, mealId = _req$body2.mealId, currentDate = _req$body2.currentDate;
          console.log(userId, barcode, mealId, currentDate); // delete food object from database

          _context5.next = 5;
          return regeneratorRuntime.awrap(Food.findOneAndDelete({
            barcode: barcode,
            mealId: mealId,
            date: currentDate
          }));

        case 5:
          deletedFood = _context5.sent;
          _context5.next = 8;
          return regeneratorRuntime.awrap(Meal.find({
            date: currentDate,
            userId: userId
          }));

        case 8:
          allMeals = _context5.sent;
          allMealIds = allMeals.map(function (meal) {
            return meal._id;
          });
          console.log(allMealIds); // add up all calories, protein, fiber, carbs, fat from all food objects

          totalCalories = 0;
          totalProtein = 0;
          totalFiber = 0;
          totalCarbs = 0;
          totalFat = 0; // get all food objects for all mealIds

          _context5.next = 18;
          return regeneratorRuntime.awrap(Food.find({
            mealId: {
              $in: allMealIds
            }
          }));

        case 18:
          allFood = _context5.sent;
          console.log(allFood);
          allFood.forEach(function (food) {
            totalCalories += food.calories;
            totalProtein += food.protein;
            totalFiber += food.fiber;
            totalCarbs += food.carbs;
            totalFat += food.fat;
          }); // 3) get activity level, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber from userSpecsCurrent by userId

          _context5.next = 23;
          return regeneratorRuntime.awrap(UserSpecsCurrent.findOne({
            userId: userId
          }));

        case 23:
          userSpecsCurrent = _context5.sent;
          // get activity level, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber from userSpecsCurrent variable
          activityLevel = userSpecsCurrent.activityLevel;
          currentWeight = userSpecsCurrent.currentWeight;
          goalCalories = userSpecsCurrent.goalCalories;
          goalProtein = userSpecsCurrent.goalProtein;
          goalCarbs = userSpecsCurrent.goalCarbs;
          goalFat = userSpecsCurrent.goalFat;
          goalFiber = userSpecsCurrent.goalFiber; // 4) Update userSpecsHistory object

          _context5.next = 33;
          return regeneratorRuntime.awrap(UserSpecsHistory.findOneAndUpdate({
            userId: userId,
            date: currentDate
          }, {
            activityLevel: activityLevel,
            currentWeight: currentWeight,
            currentCalories: totalCalories,
            goalCalories: goalCalories,
            currentProtein: totalProtein,
            goalProtein: goalProtein,
            currentCarbs: totalCarbs,
            goalCarbs: goalCarbs,
            currentFat: totalFat,
            goalFat: goalFat,
            currentFiber: totalFiber,
            goalFiber: goalFiber,
            date: currentDate,
            userId: userId
          }, {
            "new": true
          }));

        case 33:
          updatedUserSpecsHistory = _context5.sent;
          res.status(200).json({
            message: "Food deleted",
            data: deletedFood
          });
          _context5.next = 41;
          break;

        case 37:
          _context5.prev = 37;
          _context5.t0 = _context5["catch"](0);
          console.error(_context5.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context5.t0
          });

        case 41:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 37]]);
}); // Get meals and specific food data for each meal

router.get("/getUserDiary", isAuthenticated, function _callee7(req, res) {
  var _req$query, userId, date, meals, mealData, diary;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _req$query = req.query, userId = _req$query.userId, date = _req$query.date; // Query database for all meals that match the userId and date

          _context7.next = 3;
          return regeneratorRuntime.awrap(Meal.find({
            userId: userId,
            date: date
          }));

        case 3:
          meals = _context7.sent;
          _context7.next = 6;
          return regeneratorRuntime.awrap(Promise.all(meals.map(function _callee6(meal) {
            var foods;
            return regeneratorRuntime.async(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    _context6.next = 2;
                    return regeneratorRuntime.awrap(Food.find({
                      mealId: meal._id
                    }));

                  case 2:
                    foods = _context6.sent;
                    return _context6.abrupt("return", {
                      mealId: meal._id,
                      mealType: meal.category,
                      foods: foods
                    });

                  case 4:
                  case "end":
                    return _context6.stop();
                }
              }
            });
          })));

        case 6:
          mealData = _context7.sent;
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
          return _context7.stop();
      }
    }
  });
}); // simple route to create a UserSpecs document in the database

router.post("/createUserSpecsCurrent/:id", isAuthenticated, function _callee8(req, res) {
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(UserSpecsCurrent.create(req.body));

        case 3:
          res.status(201).json({
            message: "User specs current created"
          });
          _context8.next = 10;
          break;

        case 6:
          _context8.prev = 6;
          _context8.t0 = _context8["catch"](0);
          console.error(_context8.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context8.t0
          });

        case 10:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 6]]);
}); //route that get the UserSpecsCurrent document in the database

router.get("/checkUserSpecs/:id", isAuthenticated, function _callee9(req, res) {
  var userSpecs;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          console.log("hello");
          _context9.prev = 1;
          _context9.next = 4;
          return regeneratorRuntime.awrap(UserSpecsCurrent.findOne({
            userId: req.params.id
          }));

        case 4:
          userSpecs = _context9.sent;

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

          _context9.next = 12;
          break;

        case 8:
          _context9.prev = 8;
          _context9.t0 = _context9["catch"](1);
          console.error(_context9.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context9.t0
          });

        case 12:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[1, 8]]);
}); //route to update UserSpecsCurrent document in the database

router.post("/updateUserSpecsCurrent/:id", isAuthenticated, function _callee10(req, res) {
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          console.log(req.params.id);
          _context10.next = 4;
          return regeneratorRuntime.awrap(UserSpecsCurrent.findOneAndUpdate({
            userId: req.params.id
          }, req.body));

        case 4:
          res.status(200).json({
            message: "User specs current updated"
          });
          _context10.next = 11;
          break;

        case 7:
          _context10.prev = 7;
          _context10.t0 = _context10["catch"](0);
          console.error(_context10.t0);
          res.status(500).json({
            message: "Internal server error",
            error: _context10.t0
          });

        case 11:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // create get route that checks if user already has userSpecHistory for the date, if not create it

router.get("/getUserHistory/:id", isAuthenticated, function _callee11(req, res) {
  var currentDate, userId, userSpecsHistory, meals, mealIds, foods, totalCalories, totalProtein, totalFiber, totalCarbs, userSpecsCurrent, userSpecsHistoryData, newUserSpecsHistory, _userSpecsCurrent, _meals, _mealIds, _foods, _totalCalories, _totalProtein, _totalFiber, _totalCarbs, _userSpecsHistoryData, updatedUserSpecsHistory;

  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          // get current date in format YYYY-MM-DD and userId from params
          currentDate = new Date().toISOString().slice(0, 10); // const userId = req.params.id;

          userId = "123456789";
          console.log(currentDate, userId);
          console.log(UserSpecsHistory); // check if current user already has a userSpecsHistory document for the current date

          _context11.next = 6;
          return regeneratorRuntime.awrap(UserSpecsHistory.findOne({
            userId: userId,
            date: currentDate
          }));

        case 6:
          userSpecsHistory = _context11.sent;

          if (userSpecsHistory) {
            _context11.next = 31;
            break;
          }

          _context11.next = 10;
          return regeneratorRuntime.awrap(Meal.find({
            date: currentDate,
            userId: userId
          }));

        case 10:
          meals = _context11.sent;
          // create array of mealIds
          mealIds = meals.map(function (meal) {
            return meal._id;
          });
          console.log(mealIds); // query Food Model for all food objects with mealIds from mealIds array

          _context11.next = 15;
          return regeneratorRuntime.awrap(Food.find({
            mealId: {
              $in: mealIds
            }
          }));

        case 15:
          foods = _context11.sent;
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

          _context11.next = 23;
          return regeneratorRuntime.awrap(UserSpecsCurrent.findOne({
            userId: userId
          }).sort({
            date: -1
          }));

        case 23:
          userSpecsCurrent = _context11.sent;
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

          _context11.next = 28;
          return regeneratorRuntime.awrap(UserSpecsHistory.create(userSpecsHistoryData));

        case 28:
          newUserSpecsHistory = _context11.sent;
          _context11.next = 51;
          break;

        case 31:
          _context11.next = 33;
          return regeneratorRuntime.awrap(UserSpecsCurrent.findOne({
            userId: userId
          }).sort({
            date: -1
          }));

        case 33:
          _userSpecsCurrent = _context11.sent;
          _context11.next = 36;
          return regeneratorRuntime.awrap(Meal.find({
            date: currentDate,
            userId: userId
          }));

        case 36:
          _meals = _context11.sent;
          // create array of mealIds
          _mealIds = _meals.map(function (meal) {
            return meal._id;
          });
          console.log(_mealIds); // query Food Model for all food objects with mealIds from mealIds array

          _context11.next = 41;
          return regeneratorRuntime.awrap(Food.find({
            mealId: {
              $in: _mealIds
            }
          }));

        case 41:
          _foods = _context11.sent;
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
          _context11.next = 50;
          return regeneratorRuntime.awrap(UserSpecsHistory.findOneAndUpdate({
            userId: userId,
            date: currentDate
          }, {
            $set: _userSpecsHistoryData
          }, {
            "new": true
          }));

        case 50:
          updatedUserSpecsHistory = _context11.sent;

        case 51:
        case "end":
          return _context11.stop();
      }
    }
  });
});
module.exports = router;