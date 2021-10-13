const { Model, DataTypes } = require("sequelize");

const sequelize = require("../util/database");

class OrderItem extends Model {}

OrderItem.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: true,
        primaryKey: true
    },
    quantity: DataTypes.INTEGER
}, {
    sequelize,
    modelName: "orderItem"
});

module.exports = OrderItem;
