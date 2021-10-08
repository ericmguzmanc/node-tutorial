const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false
    });
}

exports.postAddProduct = (req, res, next) => {
    // products.push({ title: req.body.title });
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product(null, title, imageUrl, description, price);
    product.save()
        .then(() => { res.redirect("/"); })
        .catch(err => console.log(e));

    
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;

    // This is just to show you can get the query params
    if (!editMode) {
       return res.redirect("/"); 
    }

    const productId = req.params.productId;
    Product.findById(productId, product => {
        if (!product) {
            return res.redirect("/");
        }

        res.render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: editMode,
            product
        });
    });

}

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description
    const updatedPrice = req.body.price;

    const updatedProduct = new Product(productId, updatedTitle, updatedImageUrl, updatedDescription, updatedPrice);
    updatedProduct.save();

    res.redirect("/products");
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

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId);
    res.redirect("/admin/products");
}
