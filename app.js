const path = require("path");
const express = require("express");

// ℹ️ Database related imports
const initDatabase = require("./util/database");
const sequelize = require("./util/database");
const dbAssociations = require("./util/dbAssosiations");

const app = express();

const errorController = require("./controllers/error");

// ℹ️ Using express we set the view engine to pug
// app.set('view engine', 'pug');
app.set("view engine", "ejs");
// ℹ️ Where are the views in our project
app.set("views", "views");

// ℹ️ Routes related imports
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const User = require("./models/user");

app.use(express.urlencoded({ extended: true }));
/**
 * ℹ️ To serve files statically means that the files are not being served by express but served from the file system
 * Using express.static and middleware
 */
app.use(express.static(path.join(__dirname, "public")));

// 😔 This piece of code will be moved in next lections
app.use( async (req, res, next) => {
    const user = await User.findByPk(1);
    if (user) {
        req.user = user;
    }
    next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// 🎬 Server inizialization
(async () => {
    dbAssociations();
    // await sequelize.sync({ force: true });
    await sequelize.sync();

    // ℹ️ Creating a dummy user
    let userExists = await User.findByPk(1);

    // ℹ️ Creates a dummy user
    if (!userExists) {
        userExists = await User.create({
            name: "Max",
            email: "max@test.com"
        });

        // ℹ️ Creates a Cart for the dummy user
        await userExists.createCart();
    }

    app.listen(4006);
})();
