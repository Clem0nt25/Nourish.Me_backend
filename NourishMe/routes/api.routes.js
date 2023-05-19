const router = require("express").Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
const axios = require("axios");

router.post("/getFood", async (req, res) => {

    console.log(req.body);

    try {
        const {mealType, foodName} = req.body;

        // make api call 
        const apiData = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${foodName}&search_simple=1&action=process&json=1&page_size=1`);
        const allProdcuts = apiData.data.products;

        // for loop over the first 10 products and save it to an object
        const foodData = [];
        for (let i = 0; i < 10; i++) {
            const food = {
                foodName: allProdcuts[i].product_name,
                image: allProdcuts[i].image_front_small_url,
                barcode: allProdcuts[i]._id
            }

            console.log(allProdcuts[i].image_front_small_url)

            foodData.push(food);
        }

        console.log(foodData);


        

        // return api data to frontend
        res.status(200).json({ message: "Food data retrieved", data: apiData.data});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error });
    }

});

// make second route to call api by barcode received from frontend { barcode: 123456789, amount: 100 }

router.post("/getFoodByBarcode", isAuthenticated, async (req, res) => {
    try {
        const [barcode, amount, mealType] = req.auth;

        // make api call 
        const apiData = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        console.log(apiData);

        // return api data to frontend
        res.status(200).json({ message: "Food data retrieved", data: apiData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error });
    }

});













// simple route that checks if user already has a UserSpecs document in the database

router.get("/checkUserSpecs", isAuthenticated, async (req, res) => {
    try {
        const userSpecs = await UserSpecs.findOne({ userId: req.body.userId });
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