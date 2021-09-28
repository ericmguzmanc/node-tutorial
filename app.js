const path = require('path');
const express = require("express");
// const expressHbs = require("express-handlebars");

const app = express();


// ℹ️ Using express we set the view engine to pug
// app.set('view engine', 'pug');
app.set('view engine', 'ejs');
// ℹ️ Where are the views in our project
app.set('views', 'views');


const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(express.urlencoded({ extended: true }));
/**
 * ℹ️ To serve files statically means that the files are not being served by express but served from the file system
 * Using express.static and middleware
 */
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
    res.status(404).render("404", { pageTitle: "Page not found " });
});

app.listen(4000);
