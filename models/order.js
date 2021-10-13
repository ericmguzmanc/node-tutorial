const { Model, DataTypes } = require("sequelize");

const sequelize = require("../util/database");

class Order extends Model {}

Order.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: true,
        primaryKey: true
    }
}, {
    sequelize,
    modelName: "order"
});

module.exports = Order;
