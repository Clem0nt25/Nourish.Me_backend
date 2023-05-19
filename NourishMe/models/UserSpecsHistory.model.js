const { Schema, model } = require("mongoose");

const userSpecsHistorySchema = new Schema(
    {
        currentWeight: {
            type: Number,
            required: true,
        },
        goalWeight: {
            type: Number,
            required: true,
        },
        currentCalories: {
            type: Number,
            required: true,
        },
        goalCalories: {
            type: Number,
            required: true,
        },
        currentProtein: {
            type: Number,
            required: true,
        },
        goalProtein: {
            type: Number,
            required: true,
        },
        currentCarbs: {
            type: Number,
            required: true,
        },
        goalCarbs: {
            type: Number,
            required: true,
        },
        currentFat: {
            type: Number,
            required: true,
        },
        goalFat: {
            type: Number,
            required: true,
        },
        currentFiber: {
            type: Number,
            required: true,
        },
        goalFiber: {
            type: Number,
            required: true,
        },
        date: {
            type: String,
            required: true,
            default: () => new Date().toISOString().split('T')[0]
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
);

const UserSpecsHistory = model("UserSpecsHistory", userSpecsHistorySchema);
module.exports = UserSpecsHistory;

