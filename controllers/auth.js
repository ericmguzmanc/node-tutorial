const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator")

const {handle} = require("../util/functions");
const User = require("../models/user");

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: "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"
    }
}));

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
        errorMessage: getFlashMessage(req),
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    const [user, userError] = await handle(User.findOne({email}));

    if (userError) {
        throw new Error("Error getting the user -> " + userError);
    }

    if (!user) {
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Email Inválido",
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: []
        });
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

    return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Password Inválido",
        oldInput: {
            email: email,
            password: password
        },
        validationErrors: []
    });
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: getFlashMessage(req),
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    });
};


exports.postSignup = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("auth/signup", {
            path: "/signup",
            pageTitle: "Signup",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email,
                password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    // const [userExists, userExistsError] = await handle(User.findOne({email: email}));
    //
    // if (userExistsError) {
    //     throw new Error("Error checking if user exists -> " + userExistsError);
    // }
    //
    // if (userExists) {
    //     req.flash("error", "E-mail exists already, please pick a different one.")
    //     return res.redirect("/signup")
    // }

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

    const [sent, sentError] = await handle(transporter.sendMail({
        to: email,
        from: "ericmguzmanc@gmail.com",
        subject: "Sign Up Succeeded!",
        html: "<h1> You successfully signed up </h1>"
    }));

    if (sentError) {
        throw new Error("Error while sending email " + sentError);
    }
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
}

exports.getReset = (req, res, next) => {
    res.render("auth/reset", {
        path: "/reset",
        pageTitle: "Reset Password",
        errorMessage: getFlashMessage(req)
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            return res.redirect('/reset')
        }

        const token = buffer.toString('hex');

        const [user, userError] = await handle(User.findOne({email: req.body.email}));

        if (userError) {
            throw new Error("Error during reset " + userError);
        }

        if (!user) {
            req.flash("error", "No account with that email found.");
            return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 36600000;

        const [userSaved, userSavedError] = await handle(user.save());

        if (userSavedError) {
            throw new Error("User saved Error -> " + userSavedError);
        }

        res.redirect("/");
        const [sent, sentError] = await handle(transporter.sendMail({
            to: req.body.email,
            from: "ericmguzmanc@gmail.com",
            subject: "Password reset",
            html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:4000/reset/${token}">link</a> to set a new password</p>
            `
        }));

        if (sentError) {
            throw new Error("Error while sending email " + sentError);
        }

    });
}

exports.getNewPassword = async (req, res, next) => {
    const token = req.params.token;

    const [user, errorFindUser] = await handle(User.findOne({resetToken: token, resetTokenExpiration: { $gt: Date.now() }}));

    if (errorFindUser) {
        throw new Error("Error while getting user using token -> " + errorFindUser);
    }

    if (!user) {
        req.flash("error", "The token is no longer valid");
        return res.redirect("/reset");
    }


    res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: getFlashMessage(req),
        userId: user._id.toString(),
        passwordToken: token
    });
}

exports.postNewPassword = async (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    const [user, userFindError] = await handle(User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    }));

    if (userFindError) {
        throw new Error("Error while getting user in postNewPassword -> " + userFindError);
    }

    const [hashedPassword, errorHashing] = await handle(bcrypt.hash(newPassword, 12));

    if (errorHashing) {
        throw Error("Error hashing password -> " + errorHashing);
    }

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;


    const [savedUser, saveUserError] = await handle(user.save());

    if (saveUserError) {
        throw new Error("Error saving user -> " + saveUserError);
    }

    res.redirect("/login");

}





