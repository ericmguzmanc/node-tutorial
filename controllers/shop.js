const fs = require("fs");
const path = require("path");

const PDFdocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const { handle } = require("../util/functions");

const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const [countProducts, countError] = await handle(Product.find().countDocuments());

        if (countError) {
            throw new Error("Error while counting products -> " + countError)
        }

        const [products, error] = await handle(
            Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        );
        if (error) {
            throw new Error("Error -> " + error);
        }
        
        res.render("shop/product-list", {
            products: products,
            pageTitle: "All Products",
            path: "/products",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < countProducts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(countProducts / ITEMS_PER_PAGE)
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
        const page = parseInt(req.query.page) || 1;
        const [countProducts, countError] = await handle(Product.find().countDocuments());

        if (countError) {
            throw new Error("Error while counting products -> " + countError)
        }

        const [products, error] = await handle(
            Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        );
        
        if (error) {
            throw new Error("Error -> " + error);
        }
        
        res.render("shop/index", {
            products: products,
            pageTitle: "Shop",
            path: "/",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < countProducts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(countProducts / ITEMS_PER_PAGE)
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

exports.getInvoice = async (req, res, next) => {
    const orderId = req.params.orderId;

    try {

        const [order, orderError] = await handle(Order.findById(orderId));
        
        if (orderError) {
            throw new Error("Error getting order");
        }

        if (!order) {
            throw new Error("No order found");
        }

        if (order.user.userId.toString() !== req.user._id.toString()) {
            throw new Error("Unauthorized");
        }
        
        const invoiceName = "invoice-"+ orderId + ".pdf";
        const invoicePath = path.join("data", "invoices", invoiceName);

        const pdf = new PDFdocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        pdf.pipe(fs.createWriteStream(invoicePath));
        pdf.pipe(res); // Remember res is a writeble stream

        pdf.fontSize(26).text("Invoice", {
            underline: true
        });

        pdf.fontSize(14);

        pdf.text(" ");

        let totalPrice = 0;
        order.products.forEach(p => {
            totalPrice += p.quantity * p.product.price;
            pdf.text(p.quantity, {
                align: "left",
                continued: true
            });

            pdf.text(`${p.product.title} x ${p.product.price}`, {
                align: "right"
            })
        });

        pdf.text(" ");

        pdf.text("Total Price: $" + totalPrice, { 
            align: "right"
        });

        pdf.end();

        // 📝 This works for tiny files but loads the whole file in memory before showing it
        // we need to be able to stream bigger files in part
        // fs.readFile(invoicePath, (err, data) => {
            
        //     if (err) {
        //         return next(err);
        //     }
            
        //     res.setHeader("Content-Type", "application/pdf");
        //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        //     res.send(data);
        // });
        // const file = fs.createReadStream(invoicePath);
        // res.setHeader("Content-Type", "application/pdf");
        // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        // file.pipe(res); // ℹ️ Response object is a writable stream
    } catch (e) {
        e.httpStatusCode = 500;
        next(e);
    }
};
