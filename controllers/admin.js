const Product = require("../models/product");
const {ObjectId} = require("mongodb");

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
    });
};

exports.postAddProduct = async (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product(title, price, description, imageUrl, null, req.user._id);

    const productSaved = await product.save();

    if (productSaved) {
        res.redirect("/admin/products");
    }
};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;

    // This is just to show you can get the query params
    if (!editMode) {
        return res.redirect("/");
    }

    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (product === null) {
        return res.redirect("/");
    }

    res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product,
    });
};

exports.postEditProduct = async (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const productInstance = new Product(title, price, description, imageUrl, productId);
    const updatedProduct = await productInstance.save();

    if (updatedProduct) {
        res.redirect("/products");
    }
};

exports.getProducts = async (req, res, next) => {
    const products = await Product.fetchAll();
    if (products === null) {
        console.log("No Producs Found! 😔");
    } else {
        res.render("admin/products", {
            products,
            pageTitle: "Admin Products",
            path: "/admin/products",
        });
    }
};

exports.postDeleteProduct = async(req, res, next) => {
    const productId = req.body.productId;

    await Product.deleteById(productId);

    res.redirect("/admin/products");
};
