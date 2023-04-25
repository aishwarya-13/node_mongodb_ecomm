const express = require('express');
const bodyParser = require('body-parser');
const mongoConnect = require('./util/database.js').mongoConnect;
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session);
const csrfTo = require('csurf');
const flash = require('connect-flash');

const Users = require('./model/users.js');

//Import Routes
const shopRoutes = require('./routes/shop.js');
const adminRoutes = require('./routes/admin.js');
const authRoutes = require('./routes/auth.js');
const pageNotfoundController = require('./controller/404.js');

const app = express();

const sessionStore = new mongodbStore({
    uri: 'mongodb+srv://iaishwaryavhatkar:mongoDB7@cluster0.afuzy.mongodb.net/shop',//In which DB to store the data
    collection: 'usersession'
});

const csrfToken = csrfTo();

app.set('view engine','ejs');
app.set('views','view');

app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: 'my secret',//used for signing the hash which secretly stores our ID in the cookie. It is typically a long string value
    resave: false,//This means session will not be saved on every request. Only when something changes in the session.
    saveUninitialized: false,//Prevents the browser from using empty sessions
    store: sessionStore
}));

app.use(flash());

app.use((request,response,next)=>{
    if(!request.session.user){
        return next();
    }
    Users.getUserById(request.session.user._id).then((user)=>{
        //console.log('user', user);
        request.user = user;
        next();
    }).catch((error)=>{
        console.log('error',error);
    });
});

app.use(csrfToken);

app.use((req, res, next)=>{
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.csrfToken = req.csrfToken();
    //console.log('req in App', req.url, req.session.isAuthenticated);
    next();
})

//Routes
app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


//404
app.use(pageNotfoundController.get404);


mongoConnect((client)=>{
    app.listen('8080');
    //console.log('client',client);
    console.log('Server listening on 8080');
});