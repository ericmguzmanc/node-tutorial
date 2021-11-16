const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");
const {handle} = require("../util/functions");

const router = express.Router();


router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email address")
            .normalizeEmail(),
        body("password", "Password has to be valid.")
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin);

router.post(
    "/signup",
    [
        check("email")
            .isEmail()
            .withMessage("Email is invalid.")
            .custom(async (value, {req}) => {
                const [userExists, userExistsError] = await handle(User.findOne({email: value}));

                if (userExistsError) {
                    throw new Error("Error checking if user exists -> " + userExistsError);
                }

                if (userExists) {
                    return Promise.reject("E-mail exists already, please pick a different one.");
                }
            })
            .normalizeEmail(),
        body(
            "password",
            "Please enter a password with only numbers and text and at least 5 characters."
            )
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
        body("confirmPassword")
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Passwords do not match.");
                }
                return true
            })
            .trim()
    ],
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
