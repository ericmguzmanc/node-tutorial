const mongoose = require("mongoose");

const mongoConnect = async () => {
    return await mongoose.connect("mongodb+srv://ericmguzmanc:AHS2kRtrU5NdbiN3@cluster0.sypp8.mongodb.net/shop?retryWrites=true&w=majority");
};

exports.mongoConnect = mongoConnect;
