const Product = require("../models/product");
const Order = require("../models/order");
const { handle } = require("../util/functions");


exports.getProducts = async (req, res, next) => {
    try {
        let [products, error] = await handle(Product.find());
        
        if (error) {
            throw new Error("Error -> " + error);
        }
        
        res.render("shop/product-list", {
            products: products,
            pageTitle: "All Products",
            path: "/products"
        });
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }

}

exports.getProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const [product, error] = await handle(Product.findById(productId));
        
        if (error) {
            throw new Error("Error -> product findById " + error);
        }
        
        res.render("shop/product-detail", {
            product: product,
            pageTitle: product.title,
            path: "/products"
        });
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }

}

exports.getIndex = async (req, res, next) => {
    try {
        const [products, error] = await handle(Product.find());
        
        if (error) {
            throw new Error("Error -> " + error);
        }
        
        res.render("shop/index", {
            products: products,
            pageTitle: "Shop",
            path: "/"
        });
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.getCart = async (req, res, next) => {
    try {
        const [userCart, error] = await handle(req.user.populate("cart.items.productId"));
        
        if (error) {
            throw new Error("Error while getting the cart -> " + error);
        }
        
        const cartProducts = userCart.cart.items;
        
        res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: cartProducts
        });
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }

}

exports.postCart = async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const [product, productError] = await handle(Product.findById(productId));
        
        if (productError) {
            throw new Error("Error finding Product -> " + productError);
        }
        
        const [productAddedToCart, productAddedError] = await handle(req.user.addToCart(product));
        
        if (productAddedError) {
            throw new Error("Error Adding Product -> " + productAddedError);
        }
        
        res.redirect("/cart");
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postCartDeleteProduct = async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const [_, error] = await handle(req.user.removeFromCart(productId));
        
        if (error) {
            throw new Error("Error while removing product from cart -> " + error);
        }
        
        res.redirect("/cart");
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postOrder = async (req, res, next) => {
    try {
        const [userCart, userCartError] = await handle(req.user.populate("cart.items.productId"));
        
        if (userCartError) {
            throw new Error("Error while getting the cart -> " + userCartError);
        }
        
        const cartProducts = userCart.cart.items.map(i => {
            return {
                quantity: i.quantity,
                product: { ...i.productId._doc }
            }
        });
        
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: cartProducts
        });
        
        const [orderSaved, saveOrderError] = await handle(order.save());
        
        if (saveOrderError) {
            throw new Error("Save Error while saving order -> " + saveOrderError);
        }
        
        const [cart, clearCartError] = await handle(req.user.clearCart());
        
        if (clearCartError) {
            throw new Error("Error clearing user cart -> " + clearCartError);
        }
        
        res.redirect("/orders");
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        // const orders = await req.user.getOrders();
        const [orders, error] = await handle(Order.find({"users._id": req.user._id}));
        
        if (error) {
            throw new Error("Error while Order.find -> " + error);
        }
        
        res.render("shop/orders", {
            path: "/orders",
            pageTitle: "Your Orders",
            orders
        });
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }
};
