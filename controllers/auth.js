const bcrypt = require("bcryptjs");

const {handle} = require("../util/functions");
const User = require("../models/user");


const getFlashMessage = (req) => {
    let message = req.flash("error");
    if (message.length > 0) {
        return message[0]
    } else {
        return null;
    }
};

exports.getLogin = async (req, res, next) => {
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: getFlashMessage(req)
    });
};

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const [user, userError] = await handle(User.findOne({email}));

    if (userError) {
        throw new Error("Error getting the user -> " + userError);
    }

    if (!user) {
        req.flash("error", "Invalid email");
        return res.redirect("/login");
    }

    const [passwordMatch, validateUserError] = await handle(bcrypt.compare(password, user.password));

    if (validateUserError) {
        res.redirect("/login");
        throw new Error("Error validating user password -> " + validateUserError);
    }

    if (passwordMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save(err => {
            console.log(err);
            res.redirect("/");
        });
    }

    req.flash("error", "Invalid password");
    res.redirect("/login");
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: getFlashMessage(req)
    });
};


exports.postSignup = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const [userExists, userExistsError] = await handle(User.findOne({email: email}));

    if (userExistsError) {
        throw new Error("Error checking if user exists -> " + userExistsError);
    }

    if (userExists) {
        req.flash("error", "E-mail exists already, please pick a different one.")
        return res.redirect("/signup")
    }

    // ℹ️ User does not exist and we create a new one
    const [hashedPassword, errorHashing] = await handle(bcrypt.hash(password, 12));

    if (errorHashing) {
        throw new Error("Error while hashing password -> " + errorHashing);
    }

    const newUser = new User({
        email,
        password: hashedPassword,
        cart: { items: [] }
    });

    const [userCreated, userCreatedError] = await handle(newUser.save());

    if (userCreatedError) {
        throw new Error("Error creating user -> " + userCreatedError);
    }

    res.redirect("/login")

};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
}
