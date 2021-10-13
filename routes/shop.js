const express = require("express");

const router = express.Router();

const shopController = require("../controllers/shop");


router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/create-order", shopController.postOrder);

router.get("/orders", shopController.getOrders);

//this is a customer action
router.post("/cart-delete-item", shopController.postCartDeleteProduct);


module.exports = router;
