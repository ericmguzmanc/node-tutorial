const mongoose = require("mongoose")

const { validationResult } = require("express-validator");

const Product = require("../models/product");
const {handle} = require("../util/functions");
const fileHelper = require("../util/file");

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
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    const userId = req.user._id;

    if (!image) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/edit-product",
            editing: false,
            product: {
                title,
                price,
                description
            },
            hasError: true,
            errorMessage: "Attached file is not an image",
            validationErrors: []
        });
    }
    const errors = validationResult(req);

    console.log(image);

    try {
        if (!errors.isEmpty()) {
            return res.status(422).render("admin/edit-product", {
                pageTitle: "Add Product",
                path: "/admin/edit-product",
                editing: false,
                product: {
                    title,
                    price,
                    description
                },
                hasError: true,
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            });
        }

        const imageUrl = '/' + image.path; 
        
        const product = new Product({ 
            // _id: new mongoose.Types.ObjectId("61938a9597b634032f6581b3"), // this is just to provoke an error
            title, 
            price, 
            description, 
            imageUrl, 
            userId 
        });
        
        const [_, error] = await handle(product.save());
        
        if (error) {
            throw new Error("Save Product -> "+ error);
        }

        res.redirect("/admin/products");

    } catch (e) {
        console.log("Error Adding Product -> " + e);
        // res.redirect("/500");
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;

    // This is just to show you can get the query params
    if (!editMode) {
        return res.redirect("/");
    }

    const productId = req.params.productId;

    try {
        const [product, error] = await handle(Product.findById(productId));
        
        if (error) {
            throw new Error("Failed to find product -> " + error);
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

    } catch(e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postEditProduct = async (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;

    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            return res.status(422).render("admin/edit-product", {
                pageTitle: "Edit Product",
                path: "/admin/Edit-product",
                editing: true,
                product: {
                    title,
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

        if (image) {
            await fileHelper.deleteFile(product.imageUrl); 
            updateProduct.imageUrl = "/" + image.path;
        }

        updateProduct.description = description;
        updateProduct.price = price;
        //?????? Thanks to mongoose, any retrieved product object is also a mongoose object, hence I can use save() from mongoose
        // If its different from existing, it's going to update.
        const [saved, saveError] = await handle(updateProduct.save());
        
        if (saveError) {
            throw new Error("Save Error -> " + saveError);
        }

        res.redirect("/admin/products");
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const [products, error] = await handle(Product.find({userId: req.user._id}));
        // .populate("userId")
        // ???? you can populate after find to populate results with extra objects based on relations like Product -> User
        if (error) {
            throw new error("Error -> "+ error);
        }
        
        res.render("admin/products", {
            products,
            pageTitle: "Admin Products",
            path: "/admin/products"
        });
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }

};

exports.deleteProduct = async(req, res, next) => {
    try {
        const productId = req.params.productId;

        const [product, productError] = await handle(Product.findById(productId));

        if (productError) {
            throw new Error("Error fetching product -> " + productError);
        }

        if (!product) {
            throw new Error("Product not found");
        }

        await fileHelper.deleteFile(product.imageUrl);
        
        const [deleteProduct, deleteError] = await handle(Product.deleteOne({_id: productId, userId: req.user._id}));
        
        if (deleteError) {
            throw new Error("Delete error -> "+ deleteError);
        }
        
        res.status(200).json({message: 'Success!'})
    } catch (e) {
        // const error = new Error(e);
        // error.httpStatusCode = 500;
        // return next(error);
        res.status(500).json({message: 'Deleting product failed.'})
    }
};
