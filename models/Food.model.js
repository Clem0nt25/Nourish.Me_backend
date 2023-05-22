// create food model containing foodname, Barcode, calories, protein, fiber, kcal, carbs, foodtype as an enum including vegan, vegetarian, meat, fish, dairy, and the mealId from Meal.model.js


// Path: models/Meal.model.js

const { Schema, model } = require("mongoose");

const foodSchema = new Schema(
    {
        foodName: {
            type: String,
            required: true,
        },
        barcode: {
            type: String,
            required: true,
        },
        calories: {
            type: Number,
            required: true,
        },
        protein: {
            type: Number,
            required: true,
        },
        fiber: {
            type: Number,
            required: true,
        },
        carbs: {
            type: Number,
            required: true,
        },
        mealId: {
            type: Number,
            default: 0,
        },
        date: {
            type: String,
            required: true,
        },
    }
)

const Food = model("Food", foodSchema);
exports.Food = Food;