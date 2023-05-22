const { Schema, model } = require("mongoose");

const mealSchema = new Schema(
  {
    food: {
      type: [String],
      required: true,
      default: [],
    },
    userId: {
      type: String,
      required: true,
      default: "",
    },
    category: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  }
);

const Meal = model("Meal", mealSchema);
exports.Meal = Meal;