const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const {handle} = require("./util/functions");

const app = express();

const errorController = require("./controllers/error");
const database = require("./util/database");
const {mongoDBStore} = require("./util/database");

const MONGODB_URI = "mongodb+srv://ericmguzmanc:AHS2kRtrU5NdbiN3@cluster0.sypp8.mongodb.net/shop?retryWrites=true&w=majority";

const User = require("./models/user");

// ℹ️ Using express we set the view engine to pug
app.set("view engine", "ejs");
// ℹ️ Where are the views in our project
app.set("views", "views");

// ℹ️ Routes related imports
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(express.urlencoded({ extended: true }));
/**
 * ℹ️ To serve files statically means that the files are not being served by express but served from the file system
 * Using express.static and middleware
 */
app.use(express.static(path.join(__dirname, "public")));

const store = MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions"
})

// ⏳ Session middleware
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));


// 😔 This piece of code will be moved in next lections
app.use( async (req, res, next) => {
    const [user, error] = await handle(User.findById("617688982aa0f44403f464db"));
    if (error) {
        throw new Error("Error while getting user -> " + error);
    }
    // ℹ️ I create a new user instance to get all the functionality of the user class, within this object
    req.user = user

    next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// 🎬 Server inizialization
(async () => {

    const [_, error] = await handle(database.mongoConnect());

    if (error) {
        throw new Error("Cannot connect to database -> " + error);
    }

    const [findUser, findError] = await handle(User.findOne());

    if (findError) {
        throw new Error("Error findOne User -> " + findError);
    }

    if (!findUser) {
        const user = new User({
            name: "Eric",
            email: "eric@test.com",
            cart: {
               item: []
            }
        });
        user.save();
    }

    app.listen(4000);
})();
