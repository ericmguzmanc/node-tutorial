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
            .withMessage("Por favor entre una dirección de correo válida")
            .normalizeEmail(),
        body("password", "El password tiene que ser válido, min 5 caracteres.")
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
            .withMessage("El email es inválido.")
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
            "Por favor entre un password alfanumerico con mínimo 5 caracteres."
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
