const path = require("path");
const express = require("express");


const app = express();

const errorController = require("./controllers/error");
const database = require("./util/database");

const User = require("./models/user");

// ℹ️ Using express we set the view engine to pug
app.set("view engine", "ejs");
// ℹ️ Where are the views in our project
app.set("views", "views");

// ℹ️ Routes related imports
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.urlencoded({ extended: true }));
/**
 * ℹ️ To serve files statically means that the files are not being served by express but served from the file system
 * Using express.static and middleware
 */
app.use(express.static(path.join(__dirname, "public")));

// 😔 This piece of code will be moved in next lections
app.use( async (req, res, next) => {
    const user = await User.findById("616ea4e2d18dbdce37cb2fbe");
    if (user) {
        // ℹ️ I create a new user instance to get all the functionality of the user class, within this object
        req.user = new User(user.name, user.email, user.cart, user._id);
    }
    next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// 🎬 Server inizialization
(async () => {

    await database.mongoConnect();

    app.listen(4000);
})();
