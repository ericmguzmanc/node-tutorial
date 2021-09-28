const path = require("path");
const express = require("express");

const rootDir = require("../util/path");
const adminData = require("./admin");

const router = express.Router();

router.get("/", (req, res, next) => {
    const products = adminData.products;
    // ℹ️ this will use the default render set in app.js, We already specified the views folder in app.js
    res.render("shop", {
        products,
        pageTitle: "Shop",
        path: "/",
        hasProducts: products.length > 0
    });
});

module.exports = router;
