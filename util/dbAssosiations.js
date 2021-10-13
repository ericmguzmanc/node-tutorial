const Product = require("../models/product");
const User = require("../models/user");
const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");
const Order = require("../models/order");
const OrderItem = require("../models/order-item");

const setAssociations = () => {
    // SQL ASSOCIATIONS
    // ℹ️ With this associations, sequelize automatically add User.AddProducts() methods
    Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
    User.hasMany(Product);

    // ℹ️ Cart Associations
    User.hasOne(Cart);
    Cart.belongsTo(User);
    Cart.belongsToMany(Product, { through: CartItem});
    Product.belongsToMany(Cart, { through: CartItem});

    // ℹ️ Order associations ️️
    Order.belongsTo(User);
    User.hasMany(Order);
    Order.belongsToMany(Product, { through: OrderItem });
};

module.exports = setAssociations;
