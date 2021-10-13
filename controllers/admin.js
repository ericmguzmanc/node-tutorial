const Product = require("../models/product");
const User = require("../models/user");

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

    // this method is from the assosiations
    // req.user was assigned a dummy logged user object from sequelize
    await req.user.createProduct({
        title,
        price,
        imageUrl,
        description,
        // userId: req.user.id // Our Dummy user middle ware will append user to every request
        
    });

    // await Product.create({
    //     title,
    //     price,
    //     imageUrl,
    //     description,
    //     // userId: req.user.id // Our Dummy user middle ware will append user to every request
    // });

    res.redirect("/admin/products");
};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;

    // This is just to show you can get the query params
    if (!editMode) {
        return res.redirect("/");
    }

    const productId = req.params.productId;

    // const product = await Product.findByPk(productId);
    const products = await req.user.getProducts({
        where: {
            id: productId
        }
    });

    if (products === null) {
        return res.redirect("/");
    }

    const product = products[0];

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
    
    const updatedProduct = await Product.update({
        title,
        price,
        imageUrl,
        description,
    }, {
        where: {
            id: productId
        }
    });

    if (updatedProduct !== null) {
        res.redirect("/products");
    }
};

exports.getProducts = async (req, res, next) => {
    const products = await req.user.getProducts();
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
    
    await Product.destroy({
        where: {
            id: productId
        }
    });

    res.redirect("/admin/products");
};
