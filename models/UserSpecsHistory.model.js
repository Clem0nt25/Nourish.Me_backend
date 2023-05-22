const { Schema, model } = require("mongoose");

const userSpecsHistorySchema = new Schema(
	{
	activityLevel: {
		type: String,
		enum: ["sedentary", "light", "moderate", "active", "intense"],
		require: true,
		default: "light"
	},
	currentWeight: {
		type: Number,
		required: true,
		default: 0,
	},
	currentCalories: {
		type: Number,
		required: true,
		default: 0,
	},
	goalCalories: {
		type: Number,
		required: true,
		default: 0,
	},
	currentProtein: {
		type: Number,
		required: true,
		default: 0,
	},
	goalProtein: {
		type: Number,
		required: true,
		default: 0,
	},
	currentCarbs: {
		type: Number,
		required: true,
		default: 0,
	},
	goalCarbs: {
		type: Number,
		required: true,
		default: 0,
	},
	currentFiber: {
		type: Number,
		required: true,
		default: 0,
	},
	goalFiber: {
		type: Number,
		required: true,
		default: 30,
	},
	date: {
		type: String,
		required: true,
	},
	userId: {
		type: String,
		required: true,
	},
});

const UserSpecsHistory = model("UserSpecsHistory", userSpecsHistorySchema);
module.exports = UserSpecsHistory;
