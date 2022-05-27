const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const {handle} = require("./util/functions");

const app = express();

const errorController = require("./controllers/error");
const database = require("./util/database");
const {mongoDBStore} = require("./util/database");

const MONGODB_URI = "mongodb+srv://ericmguzmanc:2JLjjfcAEup8MdvV@cluster0.sypp8.mongodb.net/shop?retryWrites=true&w=majority";

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
 * Using express.static and middleware, To serve a folder statically means that requests to file in that folder will be handled automatically
 */
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, 'images')));


const store = MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions"
});

// const csrfProtection = csrf();

// ⏳ Session middleware
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));

// app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken =  null //req.csrfToken();
    next();
 });

// 😔 This piece of code will be moved in next lections
app.use( async (req, res, next) => {
    try {
        if (!req.session.user) {
            return next();
        }
        
        const [user, error] = await handle(User.findById(req.session.user._id));
        
        if (!user) {
            return next();
        }
        
        if (error) {
            throw new Error("Error while getting user -> " + error);
        }

        
        // ℹ️ I create a new user instance to get all the functionality of the user class, within this object
        req.user = user
    } catch (e) {
        const error = new Error(e);
        error.httpStatusCode = 500;
        next(error);
    }

    next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.log(error);
    res.status(error.httpStatusCode || 500).render("500", {
        error,
        pageTitle: "Error",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn
    });
});

// 🎬 Server inizialization
(async () => {

    const [_, error] = await handle(database.mongoConnect());

    if (error) {
        throw new Error("Cannot connect to database -> " + error);
    }

    app.listen(4000);
})();
