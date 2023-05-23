"use strict";

// create food model containing foodname, Barcode, calories, protein, fiber, kcal, carbs, foodtype as an enum including vegan, vegetarian, meat, fish, dairy, and the mealId from Meal.model.js
// Path: models/Meal.model.js
var _require = require("mongoose"),
    Schema = _require.Schema,
    model = _require.model;

var foodSchema = new Schema({
  foodName: {
    type: String,
    required: true
  },
  barcode: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  fiber: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  // mealId from Meal.model.js
  mealId: {
    type: Schema.Types.ObjectId,
    ref: "Meal"
  },
  date: {
    type: String,
    required: true
  },
  amount: Number
});
var Food = model("Food", foodSchema);
exports.Food = Food;