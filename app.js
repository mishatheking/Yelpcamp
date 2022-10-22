if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express()
const path = require("path");
const mongoose = require("mongoose");
// const ejs =require("ejs")
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require('connect-flash');
const Campground = require("./models/campground");
// const Reviews = require("./models/review");
const methodOverride = require("method-override");
const ExpressError = require("./utils/expressError");
const catchAsync = require("./utils/catchAsyc");
// const {campgroundSchema, reviewSchema} = require("./joi/schema")  // destructing is necessary when multiple items are exported 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoDBStore = require("connect-mongodb-session")(session);

//DB connection

// const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelpcamp";
// const dbUrl =  "mongodb://localhost:27017/yelpcamp";
const dbUrl = process.env.DB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}

main()
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
//end DB connection

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"))
app.engine("ejs",ejsMate)

app.use(methodOverride("_method"));
app.use(express.urlencoded ({ extended:true}));
app.use(express.static(path.join(__dirname,"public"))); //setting folder for statics folder
app.use(mongoSanitize({replaceWith: '_'}));

//setting up mongo session store
const secret = process.env.STORESECRET || 'abettersecret!';
 
const store = new MongoDBStore({
    url: dbUrl,
    secret : secret,
    touchAfter: 24 * 60 * 60  // time in seconds
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    name: "session",
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,  //access session only through https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7 //time in milseconds
        } 
    };
    
app.use(session(sessionConfig));
app.use(flash());

// app.use(helmet());

// creating lists of trusted sources to be added to helmet.contentSecurityPolicy
// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [ 
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dvoymf3j8/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// ); 


const i =1;
// ==================== Setup Passport =============

app.use(passport.initialize());
app.use(passport.session());   
passport.use(new LocalStrategy(User.authenticate()));

// How to store or retrieve the user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// Routes 
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes =  require("./routes/users");

app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", userRoutes)

//home 
app.get("/",  catchAsync(async (req,res)=>{
    res.render("campgrounds/home")
})
)


// wrong routes
app.all("*", (req,res ,next)=>{
    next(new ExpressError("Page not found", 400))
})

app.use((err,req,res,next)=>{
    const {status=500} = err;
    if(!err.message) err.message = "something broke";
    // console.log("got to middleware")
    res.status(status).render("error", {err})
})

app.listen(8000, ()=>{
    console.log("listening at port 8000")
})

