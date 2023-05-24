const router = require("express").Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { Meal } = require("../models/Meal.model");
const { Food } = require("../models/Food.model");
const UserSpecsHistory = require("../models/UserSpecsHistory.model");
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const UserSpecsCurrent = require("../models/UserSpecsCurrent.model");

// search route
router.post("/getFood", async (req, res) => {
  console.log(req.body);

  try {
    const { foodName } = req.body;

    // make api call
    const apiData = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${foodName}&search_simple=1&action=process&json=1&page_size=1`
    );
    const allProdcuts = apiData.data.products;

    // for loop over the first 10 products and save it to an object
    const foodData = [];
    for (let i = 0; i < 10; i++) {
      const name = allProdcuts[i].product_name || allProdcuts[i].brands;

      const food = {
        foodName: name,
        image: allProdcuts[i].image_front_small_url,
        barcode: allProdcuts[i]._id,
      };

      foodData.push(food);
    }

    console.log(foodData);

    // return api data to frontend
    res.status(200).json({ message: "Food data retrieved", data: foodData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// make second route to call api by barcode received from frontend { barcode: 123456789, amount: 100 }

router.post("/getFoodByBarcode", async (req, res) => {
  try {
    const { currentDate, barcode, amount, mealType, userId, _id } = req.body;

    const apiData = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const product = apiData.data.product;
    const name = product.product_name || product.brands;

    const meal = await Meal.findOne({
      userId: userId,
      date: currentDate,
      category: mealType,
    });

    let mealId;

    if (!meal) {
      const newMeal = await Meal.create({
        food: [barcode],
        userId: userId,
        category: mealType,
        date: currentDate,
      });

      mealId = newMeal._id;
    } else {
      const updatedMeal = await Meal.findOneAndUpdate(
        { userId: userId, date: currentDate, category: mealType },
        { $push: { food: barcode } },
        { new: true }
      );

      mealId = updatedMeal._id;
    }

    const productData = {
      foodName: name,
      barcode: barcode,
      calories: (product.nutriments["energy-kcal_100g"] / 100) * amount || 0,
      protein: (product.nutriments.proteins_100g / 100) * amount || 0,
      fiber: (product.nutriments.fiber_100g / 100) * amount || 0,
      carbs: (product.nutriments.carbohydrates_100g / 100) * amount || 0,
      fat: (product.nutriments.fat_100g / 100) * amount || 0,
      amount: amount,
      date: currentDate,
      mealId: mealId,
    };

    let newFood;
    if (_id) {
      // If _id is provided, update the existing food document
      newFood = await Food.findByIdAndUpdate(_id, productData, { new: true });
      console.log("Updated food item:", newFood);
    } else {
      // If _id is not provided, create a new food document
      newFood = await Food.create(productData);
      console.log("Created new food item:", newFood);
    }

    res.status(200).json({
      message: "Product data retrieved",
      data: newFood,
      objectId: newFood._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Get meals and specific food data for each meal
router.get("/getUserDiary", async (req, res) => {
  const { userId, date } = req.query;

  // Query database for all meals that match the userId and date
  const meals = await Meal.find({ userId: userId, date: date });

  const mealData = await Promise.all(
    meals.map(async (meal) => {
      // For each meal, fetch the associated foods
      const foods = await Food.find({ mealId: meal._id });

      return {
        mealId: meal._id,
        mealType: meal.category,
        foods: foods,
      };
    })
  );

  const diary = {
    breakfast: mealData.find((meal) => meal.mealType === "breakfast"),
    lunch: mealData.find((meal) => meal.mealType === "lunch"),
    dinner: mealData.find((meal) => meal.mealType === "dinner"),
    snack: mealData.find((meal) => meal.mealType === "snack"),
  };

  res.status(200).json(diary);
});

// simple route that checks if user already has a UserSpecs document in the database

router.post("/createUserSpecsCurrent/:id", async (req, res) => {
  try {
    await UserSpecsCurrent.create(req.body);
    res.status(201).json({ message: "User specs current created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

//route that get the UserSpecsCurrent document in the database

router.get("/checkUserSpecs/:id", async (req, res) => {
  console.log("hello");
  try {
    const userSpecs = await UserSpecsCurrent.findOne({ userId: req.params.id });
    if (userSpecs) {
      res.status(200).json({ message: "User specs found", data: userSpecs });
    } else {
      res.status(404).json({ message: "User specs not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// create get route that checks if user already has userSpecHistory for the date, if not create it
router.get("/getUserHistory/:id", async (req, res) => {
  // get current date in format YYYY-MM-DD and userId from params
  const currentDate = new Date().toISOString().slice(0, 10);
  // const userId = req.params.id;
  const userId = "123456789";

  console.log(currentDate, userId);
  console.log(UserSpecsHistory);

  // check if current user already has a userSpecsHistory document for the current date
  const userSpecsHistory = await UserSpecsHistory.findOne({
    userId: userId,
    date: currentDate,
  });

  // if userSpecsHistory document does not exist, query Meal Model for all mealIds for the current date and userId
  if (!userSpecsHistory) {
    const meals = await Meal.find({ date: currentDate, userId: userId });

    // create array of mealIds
    const mealIds = meals.map((meal) => meal._id);
    console.log(mealIds);

    // query Food Model for all food objects with mealIds from mealIds array
    const foods = await Food.find({ mealId: { $in: mealIds } });
    console.log(foods);

    // map over foods array create new object where total calories, protein, fiber and carbs are calculated from all foods
    const totalCalories = foods.reduce((acc, food) => acc + food.calories, 0);
    const totalProtein = foods.reduce((acc, food) => acc + food.protein, 0);
    const totalFiber = foods.reduce((acc, food) => acc + food.fiber, 0);
    const totalCarbs = foods.reduce((acc, food) => acc + food.carbs, 0);

    // find latest UserSpecsCurrent document for current user by userid and latest date
    const userSpecsCurrent = await UserSpecsCurrent.findOne({
      userId: userId,
    }).sort({ date: -1 });

    const userSpecsHistoryData = {
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
      goalCarbs: userSpecsCurrent.goalCarbs,
    };

    console.log(userSpecsHistoryData);

    // create new UserSpecsHistory document with data from userSpecsHistoryData object
    const newUserSpecsHistory = await UserSpecsHistory.create(
      userSpecsHistoryData
    );
  } else {
    // find latest UserSpecsCurrent document for current user by userid and latest date
    const userSpecsCurrent = await UserSpecsCurrent.findOne({
      userId: userId,
    }).sort({ date: -1 });
    const meals = await Meal.find({ date: currentDate, userId: userId });

    // create array of mealIds
    const mealIds = meals.map((meal) => meal._id);
    console.log(mealIds);

    // query Food Model for all food objects with mealIds from mealIds array
    const foods = await Food.find({ mealId: { $in: mealIds } });
    console.log(foods);

    // map over foods array create new object where total calories, protein, fiber and carbs are calculated from all foods
    const totalCalories = foods.reduce((acc, food) => acc + food.calories, 0);
    const totalProtein = foods.reduce((acc, food) => acc + food.protein, 0);
    const totalFiber = foods.reduce((acc, food) => acc + food.fiber, 0);
    const totalCarbs = foods.reduce((acc, food) => acc + food.carbs, 0);

    // update userSpecsHistory document with new data
    const userSpecsHistoryData = {
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
      goalCarbs: userSpecsCurrent.goalCarbs,
    };

    const updatedUserSpecsHistory = await UserSpecsHistory.findOneAndUpdate(
      { userId: userId, date: currentDate },
      { $set: userSpecsHistoryData },
      { new: true }
    );
  }
});

module.exports = router;
