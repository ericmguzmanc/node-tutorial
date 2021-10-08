const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then(([rows]) => {
        res.render("shop/product-list", {
            products: rows,
            pageTitle: "All Products",
            path: "/products",
        });
    })
    .catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(([product]) => {
            res.render("shop/product-detail", {
                product: product[0],
                pageTitle: product[0].title,
                path: "/products"
            });
        })
        .catch(err => console.log(err));
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
    .then(([rows, fieldData]) => {
        // ℹ️ this will use the default render set in app.js, We already specified the views folder in app.js
        res.render("shop/index", {
            products: rows,
            pageTitle: "Shop",
            path: "/"
        });
    })
    .catch(err => console.log(err))
}

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(p => p.id === product.id);
                if (cartProductData) {
                    cartProducts.push({productData: product, qty: cartProductData.qty});
                }
            }
            res.render("shop/cart", {
                path: "/cart",
                pageTitle: "Your Cart",
                products: cartProducts
            });
        });
    });
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        Cart.addProduct(productId, product.price);
    });
    res.redirect("/cart");
};

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;

    Product.findById(productId, product => {
        Cart.deleteProduct(productId, product.price);
        res.redirect("/cart");
    });
};

exports.getOrders = (req, res, next) => {
    res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders"
    });
};

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout"
    });
};