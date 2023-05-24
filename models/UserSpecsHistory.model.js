const { Schema, model } = require("mongoose");

const userSpecsHistorySchema = new Schema({
	activityLevel: {
		type: String,
		enum: ["sedentary", "light", "moderate", "active", "intense"],
		require: true,
	},
	currentWeight: {
		type: Number,
		required: true,
	},
	currentCalories: {
		type: Number,
		required: true,
		default: 0,
	},
	goalCalories: {
		type: Number,
		required: true,
	},
	currentProtein: {
		type: Number,
		required: true,
		default: 0,
	},
	goalProtein: {
		type: Number,
		required: true,
	},
	currentCarbs: {
		type: Number,
		required: true,
		default: 0,
	},
	goalCarbs: {
		type: Number,
		required: true,
	},
	currentFat: {
		type: Number,
		required: true,
		default: 0,
	},
	goalFat: {
		type: Number,
		required: true,
		default: 70,
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
		default: () => new Date().toISOString().split("T")[0],
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
});

const UserSpecsHistory = model("UserSpecsHistory", userSpecsHistorySchema);
module.exports = UserSpecsHistory;
