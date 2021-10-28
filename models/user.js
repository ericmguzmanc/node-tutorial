const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

// 📝 mongoose lets you add custom methods like this
// ℹ️ It has to be function() because we need the this to refer to the userSchema ️
userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(ci => ci.productId.toString() === product._id.toString());

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity
    } else {
        updatedCartItems.push({productId: product._id, quantity: newQuantity})
    }

    this.cart = {items: updatedCartItems};

    return this.save();
}

// removeFromCart
userSchema.methods.removeFromCart = function(productId) {
   this.cart.items = this.cart.items.filter(i => i.productId.toString() !== productId.toString());
   return this.save();
}


// clear cart
userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
}


module.exports = mongoose.model("User", userSchema);

// const { getDb } = require("../util/database");
// const {ObjectId} = require("mongodb");
// const {getCart} = require("../controllers/shop");
//
// class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id ? ObjectId(id) : null;
//     }
//
//     save() {
//         const db = getDb();
//         if (this._id) {
//             return db.collection("users").updateOne(
//                 { _id: this._id },
//                 { $set: this }
//             );
//         } else {
//             return db.collection("users").insertOne(this);
//         }
//     }
//
//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(ci => ci.productId.toString() === product._id.toString());
//
//         let newQuantity = 1;
//
//         const updatedCartItems = [...this.cart.items];
//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity
//         } else {
//             updatedCartItems.push({productId: ObjectId(product._id), quantity: newQuantity})
//         }
//
//         const updatedCart = { items: updatedCartItems };
//
//         const db = getDb();
//         return db.collection("users").updateOne(
//             { _id: ObjectId(this._id) },
//             { $set: { cart: updatedCart } }
//         );
//     }
//
//     async getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => i.productId);
//
//         const products = await db.collection("products").find({_id: { $in: productIds }}).toArray();
//         if (products != null) {
//             return products.map(p => {
//
//                 const q = this.cart.items.find(i => {
//                     return i.productId.toString() === p._id.toString()
//                 }).quantity
//
//                 return {
//                     ...p,
//                     quantity: q
//                 }
//             });
//         }
//     }
//
//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(i => i.productId.toString() !== productId.toString())
//
//         const db = getDb();
//         return db.collection("users").updateOne(
//             { _id: ObjectId(this._id) },
//             { $set: { cart: { items: updatedCartItems } } }
//         );
//
//     }
//
//     async addOrder() {
//         const db = getDb();
//
//         const cartProducts = await this.getCart();
//
//         if (cartProducts !== null) {
//             const order = {
//               items: cartProducts,
//               users: {
//                   _id: new ObjectId(this._id),
//                   name: this.name
//               }
//             };
//
//             const insertOrder = await db.collection("orders").insertOne( order);
//             if (insertOrder) {
//                 this.cart = { items: [] };
//                 const updateCart = await db.collection("users").updateOne(
//                     { _id: ObjectId(this._id) },
//                     { $set: { cart: { items: [] } } }
//                 );
//             }
//             return insertOrder;
//         }
//
//
//     }
//
//     async getOrders() {
//         const db = getDb();
//         //ℹ️ I can filter using nested objects, user._id ️
//        return await db.collection("orders").find({"users._id": new ObjectId(this._id)}).toArray();
//     }
//
//     static findById(userId) {
//         const db = getDb();
//         return db.collection("users").findOne({ _id: ObjectId(userId) })
//     }
// }
//
//
// module.exports = User;
