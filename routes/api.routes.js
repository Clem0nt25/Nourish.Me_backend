const router = require("express").Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { Meal } = require("../models/Meal.model");
const { Food } = require("../models/Food.model");
const UserSpecsHistory = require("../models/UserSpecsHistory.model");
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const UserSpecsCurrent = require("../models/UserSpecsCurrent.model");
const moment = require("moment");

router.post("/getFood", isAuthenticated, async (req, res) => {
  console.log(req.body);

  try {
    const { foodName } = req.body;

    // make api call
    const apiData = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${foodName}&search_simple=1&action=process&json=1&page_size=1`
    );
    const allProducts = apiData.data.products;

    // for loop over the first 10 products and save it to an object
    const foodData = [];
    for (let i = 0; i < 10; i++) {
      const name = allProducts[i].product_name || allProducts[i].brands;

      const food = {
        foodName: name,
        image: allProducts[i].image_front_small_url,
        barcode: allProducts[i]._id,
        calories: allProducts[i].nutriments["energy-kcal_100g"],
        protein: allProducts[i].nutriments.proteins_100g,
        fiber: allProducts[i].nutriments.fiber_100g,
        carbs: allProducts[i].nutriments.carbohydrates_100g,
        fat: allProducts[i].nutriments.fat_100g,
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

// Route to get just the food nutrition data by barcode
router.post("/api/getFoodInfoByBarcode", async (req, res) => {
  try {
    const { barcode } = req.body;

    // make api call
    const apiData = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    const product = apiData.data.product;

    // Prepare the food data
    const food = {
      foodName: product.product_name || product.brands,
      image: product.image_front_small_url,
      barcode: product._id,
      calories: product.nutriments["energy-kcal_100g"],
      protein: product.nutriments.proteins_100g,
      fiber: product.nutriments.fiber_100g,
      carbs: product.nutriments.carbohydrates_100g,
      fat: product.nutriments.fat_100g,
    };

    console.log(food);

    // return api data to frontend
    res.status(200).json({ message: "Food data retrieved", data: food });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// make second route to call api by barcode received from frontend { barcode: 123456789, amount: 100 }
router.post("/getFoodByBarcode", isAuthenticated, async (req, res) => {
  try {
    const { currentDate, barcode, amount, mealType, userId } = req.body;

    // 1) make api call to retrieve food data from barcode
    const apiData = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const product = apiData.data.product;
    const name = product.product_name || product.brands;

    // 2) create meal object from barcode for food, userId, category from mealType a currentDate
    // first check if meal for this day already exists based on currentDate, userId and mealType
    const meal = await Meal.findOne({
      userId: userId,
      date: currentDate,
      category: mealType,
    });
    let mealId;

    // if meal does not exist, create meal object

    if (!meal) {
      const newMeal = await Meal.create({
        food: [barcode],
        userId: userId,
        category: mealType,
        date: currentDate,
      });

      mealId = newMeal._id;
    } else {
      // if meal exists, update meal object and add barcode to food array
      const updatedMeal = await Meal.findOneAndUpdate(
        { userId: userId, date: currentDate, category: mealType },
        { $push: { food: barcode } },
        { new: true }
      );

      mealId = updatedMeal._id;
    }

    // 1.1) create food object from api data
    const productData = {
      foodName: name,
      barcode: product._id,
      calories: (product.nutriments["energy-kcal_100g"] / 100) * amount || 0,
      protein: (product.nutriments.proteins_100g / 100) * amount || 0,
      fiber: (product.nutriments.fiber_100g / 100) * amount || 0,
      carbs: (product.nutriments.carbohydrates_100g / 100) * amount || 0,
      fat: (product.nutriments.fat_100g / 100) * amount || 0,
      amount: amount,
      date: currentDate,
      mealId: mealId,
      image: product.image_front_small_url,
    };

    // 1.2) save food object to database with food model

    // check if food object based on barcode, date, and mealId already exists in database
    const food = await Food.findOne({ mealId: mealId, barcode: barcode });

    // // if food object does not exist, create food object
    if (!food) {
      const newFood = await Food.create(productData);
    } else {
      // update food object in database
      const updatedFood = await Food.findOneAndUpdate(
        { barcode: barcode, date: currentDate, mealId: mealId },
        {
          $set: {
            calories: productData.calories,
            protein: productData.protein,
            fiber: productData.fiber,
            carbs: productData.carbs,
            fat: productData.fat,
            amount: productData.amount,
          },
        },
        { new: true }
      );
    }

    // get all mealIds for the current day and userId
    const allMeals = await Meal.find({ date: currentDate, userId: userId });
    const allMealIds = allMeals.map((meal) => meal._id);
    console.log(allMealIds);

    // add up all calories, protein, fiber, carbs, fat from all food objects
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    // get all food objects for all mealIds
    const allFood = await Food.find({ mealId: { $in: allMealIds } });
    console.log(allFood);

    allFood.forEach((food) => {
      totalCalories += food.calories;
      totalProtein += food.protein;
      totalFiber += food.fiber;
      totalCarbs += food.carbs;
      totalFat += food.fat;
    });

    // 3) get activity level, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber from userSpecsCurrent by userId

    const userSpecsCurrent = await UserSpecsCurrent.findOne({ userId: userId });
    // get activity level, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber from userSpecsCurrent variable
    const activityLevel = userSpecsCurrent.activityLevel;
    const currentWeight = userSpecsCurrent.currentWeight;
    const goalCalories = userSpecsCurrent.goalCalories;
    const goalProtein = userSpecsCurrent.goalProtein;
    const goalCarbs = userSpecsCurrent.goalCarbs;
    const goalFat = userSpecsCurrent.goalFat;
    const goalFiber = userSpecsCurrent.goalFiber;

    // 4) check if user has a UserSpecshistory object for the current date
    const userSpecsHistory = await UserSpecsHistory.findOne({
      userId: userId,
      date: currentDate,
    });

    // if userSpecsHistory object does not exist, create userSpecsHistory object
    if (!userSpecsHistory) {
      const newUserSpecsHistory = await UserSpecsHistory.create({
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
        userId: userId,
      });
    } else {
      // if userSpecsHistory object exists, update userSpecsHistory object
      const updatedUserSpecsHistory = await UserSpecsHistory.findOneAndUpdate(
        { userId: userId, date: currentDate },
        {
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
          userId: userId,
        },
        { new: true }
      );
    }

    console.log("History updated");

    // return api data to frontend

    console.log("Sending data to frontend");
    res
      .status(200)
      .json({ message: "Product data retrieved", data: productData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// make get route that get UserSpecsHistory object for current date and userId (userId from params)
router.get("/userSpecsHistory/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentDate = moment().format("YYYY-MM-DD");
    console.log(userId, currentDate);

    // get userSpecsHistory object for current date and userId
    const userSpecsHistory = await UserSpecsHistory.findOne({
      userId: userId,
      date: currentDate,
    });

    // check if userSpecsHistory object exists
    if (!userSpecsHistory) {
      // if userSpecsHistory object does not exist, retrieve user specs from userSpecsCurrent
      const userSpecsCurrent = await UserSpecsCurrent.findOne({
        userId: userId,
      });

      // get activity level, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber from userSpecsCurrent variable
      const activityLevel = userSpecsCurrent.activityLevel;
      const currentWeight = userSpecsCurrent.currentWeight;
      const goalCalories = userSpecsCurrent.goalCalories;
      const goalProtein = userSpecsCurrent.goalProtein;
      const goalCarbs = userSpecsCurrent.goalCarbs;
      const goalFat = userSpecsCurrent.goalFat;
      const goalFiber = userSpecsCurrent.goalFiber;

      // create userSpecsHistory object
      const newUserSpecsHistory = await UserSpecsHistory.create({
        activityLevel: activityLevel,
        currentWeight: parseFloat(currentWeight.toFixed(1)),
        currentCalories: 0,
        goalCalories: goalCalories,
        currentProtein: 0,
        goalProtein: goalProtein,
        currentCarbs: 0,
        goalCarbs: goalCarbs,
        currentFat: 0,
        goalFat: goalFat,
        currentFiber: 0,
        goalFiber: goalFiber,
        date: currentDate,
        userId: userId,
      });

      // get userSpecsHistory object for current date and userId
      const userSpecsHistory = await UserSpecsHistory.findOne({
        userId: userId,
        date: currentDate,
      });

    } else {
      // if userSpecsHistory object exists, return userSpecsHistory object
      console.log("UserSpecsHistory object retrieved");
    }
    

    console.log(userSpecsHistory);

    res.status(200).json({
      message: "UserSpecsHistory object retrieved",
      data: userSpecsHistory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// make route that deletes food object from database based on currentDate, userId, Barcode, MealId
router.post("/deleteFood", isAuthenticated, async (req, res) => {
  try {
    const { userId, barcode, mealId, currentDate } = req.body;
    console.log(userId, barcode, mealId, currentDate);

    // delete food object from database
    const deletedFood = await Food.findOneAndDelete({
      barcode: barcode,
      mealId: mealId,
      date: currentDate,
    });

    // get all mealIds for the current day and userId
    const allMeals = await Meal.find({ date: currentDate, userId: userId });
    const allMealIds = allMeals.map((meal) => meal._id);
    console.log(allMealIds);

    // add up all calories, protein, fiber, carbs, fat from all food objects
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    // get all food objects for all mealIds
    const allFood = await Food.find({ mealId: { $in: allMealIds } });
    console.log(allFood);

    allFood.forEach((food) => {
      totalCalories += food.calories;
      totalProtein += food.protein;
      totalFiber += food.fiber;
      totalCarbs += food.carbs;
      totalFat += food.fat;
    });

    // 3) get activity level, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber from userSpecsCurrent by userId
    const userSpecsCurrent = await UserSpecsCurrent.findOne({ userId: userId });
    // get activity level, currentWeight, goalCalories, goalProtein, goalCarbs, goalFat, goalFiber from userSpecsCurrent variable
    const activityLevel = userSpecsCurrent.activityLevel;
    const currentWeight = userSpecsCurrent.currentWeight;
    const goalCalories = userSpecsCurrent.goalCalories;
    const goalProtein = userSpecsCurrent.goalProtein;
    const goalCarbs = userSpecsCurrent.goalCarbs;
    const goalFat = userSpecsCurrent.goalFat;
    const goalFiber = userSpecsCurrent.goalFiber;

    // 4) Update userSpecsHistory object
    const updatedUserSpecsHistory = await UserSpecsHistory.findOneAndUpdate(
      { userId: userId, date: currentDate },
      {
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
        userId: userId,
      },
      { new: true }
    );

    res.status(200).json({ message: "Food deleted", data: deletedFood });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Get meals and specific food data for each meal
router.get("/getUserDiary", isAuthenticated, async (req, res) => {
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

// simple route to create a UserSpecs document in the database
router.post(
  "/createUserSpecsCurrent/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      await UserSpecsCurrent.create(req.body);
      res.status(201).json({ message: "User specs current created" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error });
    }
  }
);

//route that get the UserSpecsCurrent document in the database
router.get("/checkUserSpecs/:id", isAuthenticated, async (req, res) => {
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

//route to update UserSpecsCurrent document in the database
router.post(
  "/updateUserSpecsCurrent/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      console.log(req.params.id);
      await UserSpecsCurrent.findOneAndUpdate(
        { userId: req.params.id },
        req.body
      );

      const currentDate = new Date().toISOString().slice(0, 10);

      // update userSpecsHistory document
      const userSpecsHistory = await UserSpecsHistory.findOneAndUpdate(
        { userId: req.params.id, date: currentDate },
        req.body
      );





      res.status(200).json({ message: "User specs current updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error });
    }
  }
);

// create get route that checks if user already has userSpecHistory for the date, if not create it
router.get("/getUserHistory/:id", isAuthenticated, async (req, res) => {
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
