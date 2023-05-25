# Nourish.Me

## Description

Nourish.Me is a mobile-targeted web app allows you to always be on track of your diet. Simply search and add food everyday to track and control your nutrition intake and achieve your fitness goal with Nourish.Me.

## User Stories

- **404:** As an anon/user I can see a 404 page if I try to reach a page that does not exist so that I know it's my fault
- **Signup:** As an anon I can sign up in the platform so that I can create an account to store all my information
- **Login:** As a user I can login to the platform so that I can start start using the features of this app
- **Logout:** As a user I can logout from the platform so no one else can modify my information
- **New user quesionnaire** As a new user I can be guided step by step to enter my basic information and goals, and get a diet plan that suits me
- **Daily diary** As a user I can see my diet macro nutrition goals for the current day and how much I've accomplished, and the record of every meal of that day
- **Search food** As a user I can search any food through the API and see the nutrition facts of that food
- **Add food to a meal** As a user I can add any food with a specific amount to any meal among breakfast/ lunch/ dinner/ snack
- **Edit food in a meal** As a user I can edit the amount of any food that I have added in any meal
- **Delete food and update meal** As a user I can delete any food from any meal on the current day
- **Profile** As a user I can see all my basic information and goals in my profile page
- **Edit Profile** As a user I can edit any item in my profile to update my diet plan

## Backlog

Barcode scanning:

- activate the device camera to capture the barcode on the food package and fetch food information through API

User history tracking:

- see the meals, weight and nutrition records of the past days

# Client / Frontend

## Routes

- / - Homepage
- /signup - Signup Page
- /login - Login form
- /daily-diary - <PrivateRoute/> Daily Diary Page
- /food-details/:barcode" - <PrivateRoute/> Food Details page
- /profile - <PrivateRoute/> Profile Page
- /progress-questionnaire - <PrivateRoute/> Progress Questionnaire
- /\* - 404 Page

## Pages

- Home Page (public) - Introduction, hero picture and signup button
- Signup Page (anon only) - Signup form
- Login Page (anon only) - Login form
- Daily Diary Page (user only) - Diet macro nutrition goals, nutrition intake progress, record of every meal, edit and delete food, food search bar, food search results list
- Food Details page (user only) - Picture and detailed nutrition facts of a food, amount slider and add-food button
- Profile Page (user only) - All the basic information, body specs, and diet goals of the user
- Progress Questionnaire (user only) - Progress quesions to ask a user to input basic information, body specs, and diet goals
- 404 Page (public)

## Components

- Daily Diary components
  - DailyMacros
  - FoodDiary
  - FoodSearchBar
  - FoodSearchResults
- Food Details components
  - AmountSlider
  - GramInput
  - Image
  - MealTypeSelect
  - NutritionInfo
- Progress Questionnaire / Profile (forms) components
  - NameForm
  - GoalForm
  - ActivityLevelForm
  - BaseInfoForm
  - WeightForm
- LoadingIndicator
- MainContainer
- Navbar
- PrivateRoute

## IO

## Services

- Food Service

  - getFood(foodName)
  - useGetFoodInfoByBarcode(barcode)
  - updateFoodDetails((barcode, amount, mealType, userId))
  - fetchDiary(userId)
  - updateAndFetchDiary(barcode, amount, mealType, userId)
  - fetchUserSpecs(userId)
  - fetchUserSpecsCurr(userId)
  - deleteFood(userId, barcode, mealId, currentDate)

# Server / Backend

## Models

User model

```javascript
{
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    }
}
```

UserSpecsCurrent model

```javascript
{
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
		unique: true,
	}
}
```

UserSpecsHistory model

```javascript
{
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
}
```

Food model

```javascript
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
	fat: {
		type: Number,
		required: true,
	},
	mealId: {
		type: Schema.Types.ObjectId,
		ref: "Meal",
	},
	date: {
		type: String,
		required: true,
	},
	amount: Number,
	image: String,
}
```

Meal model

```javascript
{
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
}
```

## API Endpoints/Backend Routes

- GET /
- POST /signup
  - body:
    - email
    - password
- POST /login
  - body:
    - email
    - password
  - return:
    - token
- GET /verify
  - auth:
    - userId
  - return:
    - id
    - email
- POST /getFood
  - body:
    - foodName
  - return:
    - foodData
- POST /getFoodByBarcode
  - body:
    - currentDate
    - barcode
    - amount
    - mealType
    - userId
  - return:
    - productData
- GET /userSpecsHistory/:userId
  - return:
    - userSpecsHistory
- GET /checkUserSpecs/:userId
  - return
  - userSpecsCurrent
- POST /deleteFood
  - body:
    - currentDate
    - barcode
    - mealId
    - userId
  - return:
    - deletedFood
- GET /getUserDiary
  - query:
    - date
    - userId
  - return:
    - diary
- POST /createUserSpecsCurrent/:userId
  - body:
    - username
    - gender
    - yearOfBirth
    - height
    - mainGoal
    - activityLevel
    - currentWeight
    - goalWeight
    - weightChangePerWeek
    - goalCalories
    - goalProtein
    - goalCarbs
    - goalFat
    - goalFiber
- POST /updateUserSpecsCurrent/:userId
  - body:
    - username
    - gender
    - yearOfBirth
    - height
    - mainGoal
    - activityLevel
    - currentWeight
    - goalWeight
    - weightChangePerWeek
    - goalCalories
    - goalProtein
    - goalCarbs
    - goalFat
    - goalFiber
- GET /getUserHistory/:userId

## Links

### Trello

[Link to the trello board](https://trello.com/b/hyWTtruW/nutrition-app)

### Git

The url to the repository and to the deployed project

[Client repository Link](https://github.com/Clem0nt25/Nourish.Me_Frontend)
[Server repository Link](https://github.com/Clem0nt25/Nourish.Me_backend)

[Deploy Link](https://legendary-flan-7ecf97.netlify.app/)

### Slides

The url to the presentation slides

[Slides Link](https://docs.google.com/presentation/d/1oz-d6VPOAZ-MYno3PQ921mUCL7qJcQK4GiX3Tj1EYCA/edit?usp=sharing)
