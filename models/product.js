const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

module.exports = mongoose.model("Product", productSchema);


// const { getDb } = require("../util/database");
// const {ObjectId} = require("mongodb");
//
// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? ObjectId(id) : null;
//         this.userId = userId;
//     }
//
//      save() {
//         const db = getDb();
//
//         if (this._id) {
//             // update
//             return db.collection("products")
//                 .updateOne( { _id: this._id }, { $set:  this } )
//         } else {
//             return db.collection("products").insertOne(this);
//         }
//     }
//
//     static async fetchAll() {
//         const db = getDb();
//         return await db.collection('products').find().toArray();
//     }
//
//     static async findById(id) {
//         const db = getDb();
//         // ℹ️ we use .next because the returned object is a cursor, the .next take the first
//         return await db.collection('products').find({ _id: ObjectId(id) }).next();
//     }
//
//     static async deleteById(id) {
//         const db = getDb();
//         return await db.collection('products').deleteOne({ _id: ObjectId(id) });
//     }
// }
//
// module.exports = Product;
