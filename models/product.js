const fs = require("fs");

const fileUtil = require("../util/file");


class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        fileUtil.getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(fileUtil.p, JSON.stringify(products), (err) => {
                console.log(err);
            });
        });
    }

    static fetchAll(cb) {
        fileUtil.getProductsFromFile(cb);
    }
}

module.exports = Product;
