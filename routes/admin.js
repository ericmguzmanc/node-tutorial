const express = require("express");

const productsController = require("../controllers/products");

const router = express.Router();


// ℹ️ /admin/add-product => GET
router.get("/add-product", productsController.getAddProduct);

// ℹ️ /admin/add-product => POST
router.post("/add-product", productsController.postAddProduct);


module.exports = router;
