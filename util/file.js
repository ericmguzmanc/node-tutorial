const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
const { handle } = require("./functions");


const p = path.join(
    path.dirname(require.main.filename),
    "data",
    "products.json"
);

const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};

const deleteFile = filePath => new Promise((resolve, reject) => {
    fs.unlink(filePath.slice(1), err => {
        if (err) {
            reject(new Error(err));
        }
        resolve(path);
    })
});

module.exports = {
    p,
    getProductsFromFile,
    deleteFile
}