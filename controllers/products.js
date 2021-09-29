const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(rootDir, "views", "add-product.html"));
    res.render("add-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product"
    });
}

exports.postAddProduct = (req, res, next) => {
    // products.push({ title: req.body.title });
    const product = new Product(req.body.title);
    product.save();

    res.redirect("/");
}

exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        // ℹ️ this will use the default render set in app.js, We already specified the views folder in app.js
        res.render("shop", {
            products,
            pageTitle: "Shop",
            path: "/",
            hasProducts: products.length > 0
        });
    });
}