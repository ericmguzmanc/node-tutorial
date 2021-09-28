const path = require("path");
const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

const products = [];

// ℹ️ /admin/add-product => GET
router.get("/add-product", (req, res, next) => {
    // res.sendFile(path.join(rootDir, "views", "add-product.html"));
    res.render("add-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product"
    });
});

// ℹ️ /admin/add-product => POST
router.post("/add-product", (req, res, next) => {
    products.push({ title: req.body.title });
    res.redirect("/");
});

exports.routes = router;
/**
 * ℹ️ This object is stored in memory, it is shared between diferent files
 * Just need to import it.
 */
exports.products = products;
