const express = require("express");
const { body } = require("express-validator");

// Multer configuration to upload images
const multer = require("multer");
// ℹ️ configuring the destination and file name for our files
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() +  "_" +  file.originalname);
    }
});

// ℹ️ only saving if it's a supported file
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true); // if we want to save that file 
    } else {
        cb(null, false); // if we don't want to save that file
    }
}

const upload = multer({ storage:  fileStorage, fileFilter });

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// app.use(multer({dest: "images"}).single("image"));


// ℹ️ /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// ℹ️ /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// ℹ️ /admin/add-product => POST
router.post("/add-product",
    upload.single("image"),
    [
        body("title", "Por favor escriba un título válido")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body("price", "Por favor entre un precio válido e.g. 9.00")
            .isFloat(),
        body("description", "Por favor entre una descripción válida min 5 and max 400")
            .isLength({ min: 5, max: 400 })
            .trim(),
        ], 
    isAuth, 
    adminController.postAddProduct);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product", 
    upload.single("image"),
    [
        body("title", "Por favor entre un título válido")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body("price", "Por favor entre un precio válido e.g. 9.00")
            .isFloat(),
        body("description", "Por favor entre una descripción válida min 5 and max 400")
            .isLength({ min: 5, max: 400 })
            .trim()
    ], 
    isAuth, 
    adminController.postEditProduct);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
