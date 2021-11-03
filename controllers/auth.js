const {handle} = require("../util/functions");


exports.getLogin = async (req, res, next) => {
    console.log(req.session)
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: false
    });
};

exports.postLogin = async (req, res, next) => {
    req.session.isLoggedIn = true;
    res.redirect("/");
}

exports.postLogout = async (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
}
