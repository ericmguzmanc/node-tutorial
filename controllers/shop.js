const Product = require("../models/product");

exports.getProducts = async (req, res, next) => {
    const products = await Product.findAll();

    if (products === null) {
        console.log("No se encontraron productos");
    } else {
        res.render("shop/product-list", {
            products: products,
            pageTitle: "Todos los productos",
            path: "/products",
        });
    }
}

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId;

    const product = await Product.findByPk(productId);
    if (product === null) {
        console.log("No se encontraron productos! 😔");
    } else {
        res.render("shop/product-detail", {
            product: product,
            pageTitle: product.title,
            path: "/products"
        });
    }
}

exports.getIndex = async (req, res, next) => {
    const products = await Product.findAll();

    if (products === null) {
        console.log("No se encontraron productos");
    } else {
        res.render("shop/index", {
            products: products,
            pageTitle: "Tienda",
            path: "/"
        });
    }
}

exports.getCart = async (req, res, next) => {
    const userCart = await req.user.getCart({ include: ["products"] });
    if (userCart !== null) {
        const cartProducts = await userCart.getProducts();
        console.log(cartProducts);
        res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Tu Carrito",
            products: cartProducts,
            cartTotal: getOrderTotal(userCart.products)
        });
    }

}

exports.postCart = async (req, res, next) => {
    const productId = req.body.productId;
    const userCart = await req.user.getCart();
    let newQuantity = 1;

    if (userCart) {
        const cartProducts = await userCart.getProducts({ where: { id: productId } });

        let productAlreadyAdded;
        if (cartProducts.length > 0) {
            productAlreadyAdded = cartProducts[0];
        }

        if (productAlreadyAdded) {
            const oldQuantity = productAlreadyAdded.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            await userCart.addProduct(productAlreadyAdded, {
                through: { quantity: newQuantity }
            });
        } else {
            const newProduct = await Product.findByPk(productId);
            userCart.addProduct(newProduct, {
                through: {
                    quantity: newQuantity
                }
            });
        }

    }
    res.redirect("/cart");
};

exports.postCartDeleteProduct = async (req, res, next) => {
    const productId = req.body.productId;
    const userCart = await req.user.getCart();

    const cartProducts = await userCart.getProducts({ where: { id: productId} });
    const product = cartProducts[0];

    const productDeleted = await product.cartItem.destroy();

    if (productDeleted) {
        res.redirect("/cart");
    }
};

exports.postOrder = async (req, res, next) => {
    const userCart = await req.user.getCart();
    const products = await userCart.getProducts();

    if (products.length > 0) {
        const newOrder = await req.user.createOrder();

        const mappedProducts = products.map(p => {
            p.orderItem = { quantity: p.cartItem.quantity };
            return p;
        });

        await newOrder.addProducts(mappedProducts);

        await userCart.setProducts(null);

        res.redirect("/orders");
    }


};

exports.getOrders = async (req, res, next) => {
    let orders = await req.user.getOrders({ include: ["products"] });
    console.log(orders)

    orders = orders.map(order => {
        orderTotal = 0
        return {
            ...order,
            orderTotal: getOrderTotal(order.products)
        }
    })

    console.log(orders)


    if (orders !== null) {
        res.render("shop/orders", {
            path: "/orders",
            pageTitle: "Tus Ordenes",
            orders
        });
    }
};

const getOrderTotal = (products) => {
    let orderTotal = 0

    products.forEach(p =>  {
        orderTotal += p.price
    })

    return orderTotal
}