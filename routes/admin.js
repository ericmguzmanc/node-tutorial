const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");

const router = express.Router();


// ℹ️ /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// ℹ️ /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// ℹ️ /admin/add-product => POST
router.post("/add-product",[
    body("title", "Please enter a valid title")
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body("imageUrl", "Please enter a valid Image url")
        .isURL(),
    body("price", "Please enter a valid price e.g. 9.00")
        .isFloat(),
    body("description", "Please enter a valid description of min 5 and max 400")
        .isLength({ min: 5, max: 400 })
        .trim()
], isAuth, adminController.postAddProduct);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product", [
    body("title", "Please enter a valid title")
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body("imageUrl", "Please enter a valid Image url")
        .isURL(),
    body("price", "Please enter a valid price e.g. 9.00")
        .isFloat(),
    body("description", "Please enter a valid description of min 5 and max 400")
        .isLength({ min: 5, max: 400 })
        .trim()
], isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
