const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const MONGODB_URI = "mongodb+srv://ericmguzmanc:2JLjjfcAEup8MdvV@cluster0.sypp8.mongodb.net/shop?retryWrites=true&w=majority";

const mongoConnect = async () => {
    return await mongoose.connect(MONGODB_URI);
};

const mongoDBStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions"
})

exports.mongoConnect = mongoConnect;
exports.mongoDBStore = MongoDBStore;

