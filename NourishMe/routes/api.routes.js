const router = require("express").Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
const axios = require("axios");

router.post("/getFood", async (req, res) => {

    console.log(req.body);

    try {
        const {mealType, foodName} = req.body;

        // make api call 
        const apiData = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${foodName}&search_simple=1&action=process&json=1&page_size=1`);
        console.log(apiData.data.products[0]);

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
        const [barcode, amount] = req.auth;

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












module.exports = router;