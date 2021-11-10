const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
      type: String,
      required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
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

