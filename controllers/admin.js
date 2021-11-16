const { validationResult } = require("express-validator");

const Product = require("../models/product");
const {handle} = require("../util/functions");

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddProduct = async (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const userId = req.user._id;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/edit-product",
            editing: false,
            product: {
                title,
                imageUrl,
                price,
                description
            },
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const product = new Product({ title, price, description, imageUrl, userId });

    const [_, error] = await handle(product.save());

    if (error) {
        throw new Error("Error Save Product -> "+ error);
    }

    res.redirect("/admin/products");
};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;

    // This is just to show you can get the query params
    if (!editMode) {
        return res.redirect("/");
    }

    const productId = req.params.productId;

    const [product, error] = await handle(Product.findById(productId));

    if (error) {
        return res.redirect("/");
    }

    res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postEditProduct = async (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/Edit-product",
            editing: true,
            product: {
                title,
                imageUrl,
                price,
                description,
                _id: productId
            },
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const [updateProduct, productError] = await handle(Product.findById(productId));

    if (productError) {
        throw new Error("Error -> " + productError);
    }

    if ((updateProduct !== null && updateProduct.userId.toString()) !== req.user._id.toString()) {
        return res.redirect("/");
    }

    updateProduct.title = title;
    updateProduct.imageUrl = imageUrl;
    updateProduct.description = description;
    updateProduct.price = price;
    //ℹ️ Thanks to mongoose, any retrieved product object is also a mongoose object, hence I can use save() from mongoose
    // If its different from existing, it's going to update.
    const [saved, saveError] = await handle(updateProduct.save());

    if (saveError) {
        throw new Error("Save Error -> " + saveError);
    }

    res.redirect("/admin/products");

};

exports.getProducts = async (req, res, next) => {
    const [products, error] = await handle(Product.find({userId: req.user._id}));
    // .populate("userId")
    // 📝 you can populate after find to populate results with extra objects based on relations like Product -> User
    if (error) {
        throw new error("Error -> "+ error);
    }

    res.render("admin/products", {
        products,
        pageTitle: "Admin Products",
        path: "/admin/products"
    });

};

exports.postDeleteProduct = async(req, res, next) => {
    const productId = req.body.productId;

    const [deleteProduct, deleteError] = await handle(Product.deleteOne({_id: productId, userId: req.user._id}));

    if (deleteError) {
        throw new Error("Delete error -> "+ deleteError);
    }

    res.redirect("/admin/products");
};
