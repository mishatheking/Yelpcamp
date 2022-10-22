const Campground = require('./models/campground');
const Reviews = require("./models/review");
const ExpressError = require("./utils/expressError");
const {campgroundSchema, reviewSchema} = require("./joi/schema");

module.exports.validateCampground = (req, res, next) =>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body);
    const {id} = req.params;
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        // throw new ExpressError(msg, 400);
        req.flash("error", msg);
        // req.flash("error", "Review cant be empty");
        res.redirect(`/campgrounds/${id}`)
    } else{
        next();
    }
}

module.exports.isLoggedin = (req, res, next)=>{
    if (! req.isAuthenticated()){
        req.flash("error", "You must be logged in first");
        if (req.originalUrl.indexOf("review") !== -1){
                const a = req.originalUrl;
                const b = a.replace(/reviews/g, "");
                req.session.returnTo = b;
                // console.log(`a -> ${a}`);
                // console.log(`b -> ${b}`);
                // console.log(req.session.returnTo);
        }else{
                req.session.returnTo = req.originalUrl;
        }
        return res.redirect("/login")
    }
    next();
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)){
        req.flash("error", "You dont have permission to do that");
        return res.redirect(`/campground${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async(req, res, next) =>{
    const { id, reviewId } = req.params;
    const review = await Reviews.findById(reviewId);
    console.log(review);
    if (!review.author.equals(req.user._id)){
        req.flash("error", "You dont have permission to do that");
        return res.redirect(`/campground${id}`);
    } 
    next()
}