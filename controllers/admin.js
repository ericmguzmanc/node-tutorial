const Product = require("../models/product");
const {handle} = require("../util/functions");

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postAddProduct = async (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const userId = req.user._id;

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
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postEditProduct = async (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const [updateProduct, productError] = await handle(Product.findById(productId));

    if (productError) {
        throw new Error("Error -> " + productError);
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
    const [products, error] = await handle(Product.find());
    // .populate("userId")
    // 📝 you can populate after find to populate results with extra objects based on relations like Product -> User
    if (error) {
        throw new error("Error -> "+ error);
    }

    res.render("admin/products", {
        products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn
    });

};

exports.postDeleteProduct = async(req, res, next) => {
    const productId = req.body.productId;

    const [deleteProduct, deleteError] = await handle(Product.findByIdAndRemove(productId));

    if (deleteError) {
        throw new Error("Delete error -> "+ deleteError);
    }

    res.redirect("/admin/products");
};
