const { Schema, model } = require("mongoose");

const mealSchema = new Schema(
    {
        food: {
            type: [String],
            required: true,
            default: [],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        category: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snack'],
            required: true,
        },
        date: {
            type: String,
            required: true,
            default: () => new Date().toISOString().split('T')[0]
        },
}
);

const Meal = model("Meal", mealSchema);
exports.Meal = Meal;
