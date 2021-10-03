const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(rootDir, "views", "add-product.html"));
    res.render("admin/add-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product"
    });
}

exports.postAddProduct = (req, res, next) => {
    // products.push({ title: req.body.title });
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product(title, imageUrl, description, price);
    product.save();

    res.redirect("/");
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        // ℹ️ this will use the default render set in app.js, We already specified the views folder in app.js
        res.render("admin/products", {
            products,
            pageTitle: "Admin Products",
            path: "/admin/products"
        });
    });
}
