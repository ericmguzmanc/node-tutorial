const Product = require("../models/product");
const {getDb} = require("../util/database");
const {ObjectId} = require("mongodb");

exports.getProducts = async (req, res, next) => {
    const products = await Product.fetchAll();

    if (products === null) {
        console.log("No Products Found");
    } else {
        res.render("shop/product-list", {
            products: products,
            pageTitle: "All Products",
            path: "/products",
        });
    }
}

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (product) {
        res.render("shop/product-detail", {
            product: product,
            pageTitle: product.title,
            path: "/products"
        });
    } else {
        console.log("No Product Found! 😔");
    }
}

exports.getIndex = async (req, res, next) => {
    const products = await Product.fetchAll();

    if (!products) {
        console.log("No Products Available");
    } else {
        res.render("shop/index", {
            products: products,
            pageTitle: "Shop",
            path: "/"
        });
    }
}

exports.getCart = async (req, res, next) => {
    const userCart = await req.user.getCart();
    if (userCart !== null) {
        const cartProducts = userCart;
        console.log(cartProducts);
        res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: cartProducts
        });
    }

}

exports.postCart = async (req, res, next) => {
    const productId = req.body.productId;

    const product = await Product.findById(productId);

    if (product) {
        const productAddedToCart = await req.user.addToCart(product);
        console.log(productAddedToCart);
    }

    res.redirect("/cart");
};

exports.postCartDeleteProduct = async (req, res, next) => {
    const productId = req.body.productId;

    const productDeleted = await req.user.deleteItemFromCart(productId);

    if (productDeleted) {
        res.redirect("/cart");
    }
};

exports.postOrder = async (req, res, next) => {

    const addOrder = await req.user.addOrder();

    if (addOrder) {
        res.redirect("/orders");
    }
};

exports.getOrders = async (req, res, next) => {
    const orders = await req.user.getOrders();
    if (orders !== null) {
        res.render("shop/orders", {
            path: "/orders",
            pageTitle: "Your Orders",
            orders
        });
    }
};
