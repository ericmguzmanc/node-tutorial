const Product = require("../models/product");


exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        // ℹ️ this will use the default render set in app.js, We already specified the views folder in app.js
        res.render("shop/product-list", {
            products,
            pageTitle: "All Products",
            path: "/products",
        });
    });
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        // ℹ️ this will use the default render set in app.js, We already specified the views folder in app.js
        res.render("shop/index", {
            products,
            pageTitle: "Shop",
            path: "/"
        });
    });
}

exports.getCart = (req, res, next) => {
    res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart"
    });
}

exports.getOrders = (req, res, next) => {
    res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders"
    });
}

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout"
    });
}