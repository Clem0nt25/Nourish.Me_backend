const router = require("express").Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { Meal } = require("../models/Meal.model");
const { Food } = require("../models/Food.model");
const axios = require("axios");
const mongoose = require("mongoose");


// search route
router.post("/getFood", async (req, res) => {

    console.log(req.body);

    try {
        const {foodName} = req.body;

        // make api call 
        const apiData = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${foodName}&search_simple=1&action=process&json=1&page_size=1`);
        const allProdcuts = apiData.data.products;

        // for loop over the first 10 products and save it to an object
        const foodData = [];
        for (let i = 0; i < 10; i++) {

            const name = allProdcuts[i].product_name || allProdcuts[i].brands;


            const food = {
                foodName: name,
                image: allProdcuts[i].image_front_small_url,
                barcode: allProdcuts[i]._id
            }
            
            foodData.push(food);
        }

        console.log(foodData);

        // return api data to frontend
        res.status(200).json({ message: "Food data retrieved", data: foodData});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error });
    }

});


router.post("/getFoodByBarcode", async (req, res) => {
    try {
        const {currentDate, barcode, amount, mealType, userId} = req.body;

        // 1) make api call to retrieve food data from barcode
        const apiData = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const product = apiData.data.product;
        const name = product.product_name || product.brands;

        // 2) create meal object from barcode for food, userId, category from mealType a currentDate
        // first check if meal for this day already exists based on currentDate, userId and mealType
        const meal = await Meal.findOne({ userId: userId, date: currentDate, category: mealType });
        let mealId;

        // if meal does not exist, create meal object

        if(!meal) {
            const newMeal = await Meal.create({
                food: [barcode],
                userId: userId,
                category: mealType,
                date: currentDate
            })

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
            calories: product.nutriments['energy-kcal_100g'] / 100 * amount || 0,
            protein: product.nutriments.proteins_100g / 100 * amount || 0,
            fiber: product.nutriments.fiber_100g / 100 * amount || 0,
            carbs: product.nutriments.carbohydrates_100g / 100 * amount || 0,
            date: currentDate,
            mealId: mealId
        };

        // 1.2) save food object to database with food model

        // check if food object based on barcode and date already exists in database
        const food = await Food.findOne({ mealId: mealId });

        // if food object does not exist, create food object
        if(!food) {
            const newFood = await Food.create(productData);
        } else {
            // update food object in database
            const updatedFood = await Food.findOneAndUpdate(
                { barcode: barcode, date: currentDate }, 
                {
                    $inc: {
                        calories: productData.calories,
                        protein: productData.protein,
                        fiber: productData.fiber,
                        carbs: productData.carbs
                    }
                }, 
                { new: true }
            );
        }

        // return api data to frontend
        res.status(200).json({ message: "Product data retrieved", data: productData});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error });
    }

});













// simple route that checks if user already has a UserSpecs document in the database

router.get("/checkUserSpecs/:id", isAuthenticated, async (req, res) => {
    try {
        const userSpecs = await UserSpecs.findOne({ userId: req.params.id });
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











module.exports = router;