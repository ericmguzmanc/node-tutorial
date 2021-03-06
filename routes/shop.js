const express = require("express");

const router = express.Router();

const shopController = require("../controllers/shop");

const isAuth = require("../middleware/is-auth");


router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.get("/checkout", isAuth, shopController.getCheckout)

router.get("/checkout/success", shopController.getCheckoutSuccess)

router.get("/checkout/cancel", shopController.getCheckout)

// router.post("/create-order", isAuth, shopController.postOrder); // this route worked before stripe integration

router.get("/orders", isAuth, shopController.getOrders);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.post("/buscar", shopController.buscar);


module.exports = router;
