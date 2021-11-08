const express = require("express");

const router = express.Router();

const shopController = require("../controllers/shop");

const isAuth = require("../middleware/is-auth");

//
router.get("/", shopController.getIndex);
//
router.get("/products", shopController.getProducts);
//
router.get("/products/:productId", shopController.getProduct);
//
router.get("/cart", isAuth, shopController.getCart);
//
router.post("/cart", isAuth, shopController.postCart);
//
router.post("/create-order", isAuth, shopController.postOrder);
//
router.get("/orders", isAuth, shopController.getOrders);
// //this is a customer action
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);


module.exports = router;
