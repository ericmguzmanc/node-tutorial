const fs = require("fs");

const fileUtil = require("../util/file");
const Cart = require("./cart");


class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        fileUtil.getProductsFromFile(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(p => p.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(fileUtil.p, JSON.stringify(updatedProducts), (err) => {
                    console.log(err);
                });
            } else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(fileUtil.p, JSON.stringify(products), (err) => {
                    console.log(err);
                });
            }
        });
    }

    static deleteById(id) {
        fileUtil.getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            const updatedProducts = products.filter(p => p.id !== id);
            fs.writeFile(fileUtil.p, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.deleteProduct(id, product.price);
                }
            });
        });
    }

    static fetchAll(cb) {
        fileUtil.getProductsFromFile(cb);
    }

    static findById(id, cb) {
        fileUtil.getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            cb(product);
        });
    }
}

module.exports = Product;
