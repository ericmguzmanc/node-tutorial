const fs = require('fs');
const path = require("path");


const p = path.join(
    path.dirname(require.main.filename),
    'data',
    'cart.json'
);

class Cart {
    /**
     * ℹ️ We use static methods because we are not using db yet
     * the static methods will not be used in comming modules.
     */

    static addProduct(id, price) {
        // 🛒 Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            } 

            // 🔎 Analyze the cart => Find existing product
            const existingProductIndex = cart.products.findIndex(p => p.id == id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;

            // ➕ Add new product/ increase quantity
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                //cart.products = [...cart.products]; // Is this needed? ❓
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }

            cart.totalPrice = cart.totalPrice + +price;

            // 💾 Save cart on file
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        }); 
    }

    static deleteProduct(id, price) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return;
            }

            const updatedCart = { ...JSON.parse(fileContent) };
            const product = updatedCart.products.find(p => p.id === id);
            if (!product) {
                return;
            }

            const productQty = product.qty;

            updatedCart.products = updatedCart.products.filter(p => p.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - price * productQty;

            // 💾 Save cart on file
            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            });
        });
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) {
                cb(null)
            } else {
                cb(cart);
            }
        });
    }

}

module.exports = Cart;