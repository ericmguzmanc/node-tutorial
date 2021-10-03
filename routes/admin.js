const express = require("express");

const adminController = require("../controllers/admin");

const router = express.Router();


// ℹ️ /admin/add-product => GET
router.get("/add-product", adminController.getAddProduct);

// ℹ️ /admin/products => GET
router.get("/products", adminController.getProducts);

// ℹ️ /admin/add-product => POST
router.post("/add-product", adminController.postAddProduct);



module.exports = router;
