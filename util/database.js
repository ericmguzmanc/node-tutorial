const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = async () => {
    // const promise = new Promise((resolve, reject) => {
    //     MongoClient.connect("mongodb+srv://ericmguzmanc:AHS2kRtrU5NdbiN3@cluster0.sypp8.mongodb.net/shop?retryWrites=true&w=majority")
    //         .then(client => {
    //             console.log("Connected!");
    //             _db = client.db();
    //         })
    //         .catch(err => {
    //             throw err;
    //         })
    // });

    const connection = await MongoClient.connect("mongodb+srv://ericmguzmanc:AHS2kRtrU5NdbiN3@cluster0.sypp8.mongodb.net/shop?retryWrites=true&w=majority");

    if (connection.db()) {
        _db = connection.db();
        console.log("Connected to mongodb!");
    } else {
        console.log(connection);
    }
}

const getDb = () => {
    if (_db) {
        return _db;
    } else {
        throw "No database found!"
    }
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
