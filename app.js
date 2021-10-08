const path = require('path');
const express = require("express");
// const expressHbs = require("express-handlebars");

const app = express();

const errorController = require("./controllers/error");


// ℹ️ Using express we set the view engine to pug
// app.set('view engine', 'pug');
app.set('view engine', 'ejs');
// ℹ️ Where are the views in our project
app.set('views', 'views');


const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(express.urlencoded({ extended: true }));
/**
 * ℹ️ To serve files statically means that the files are not being served by express but served from the file system
 * Using express.static and middleware
 */
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(4000);
