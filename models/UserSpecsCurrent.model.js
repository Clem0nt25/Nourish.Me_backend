const { Schema, model } = require("mongoose");

const userSpecsCurrentSchema = new Schema({
	username: {
		type: String,
		default: "New Nourish User",
	},
	gender: {
		type: String,
		enum: ["female", "male"],
		require: true,
	},
	yearOfBirth: {
		type: Number,
		require: true,
	},
	height: {
		type: Number,
		require: true,
	},
	mainGoal: {
		type: String,
		enum: ["bulk-up", "get-strong", "recompose", "get-lean", "keep-shape"],
		require: true,
	},
	activityLevel: {
		type: String,
		enum: ["sedentary", "light", "moderate", "active", "intense"],
		require: true,
	},
	currentWeight: {
		type: Number,
		required: true,
	},
	goalWeight: {
		type: Number,
		required: true,
	},
	weightChangePerWeek: {
		type: String,
		enum: ["0.25kg", "0.5kg", "0.75kg", "skip"],
		require: true,
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

const UserSpecsCurrent = model("UserSpecsCurrent", userSpecsCurrentSchema);
module.exports = UserSpecsCurrent;
