const express = require("express");
const Campground = require("../models/campground");
const Reviews = require("../models/review");
// const ExpressError = require("../utils/expressError");
const catchAsync = require("../utils/catchAsyc");
// const {reviewSchema} = require("../joi/schema")  // destructing is necessary when multiple items are exported 
 const {isLoggedin, isReviewAuthor, validateReview} = require("../middleware");


const router = express.Router({mergeParams:true});


// validators
// const validateReview = (req, res, next) =>{
//     const {error} = reviewSchema.validate(req.body);
//     const {id} = req.params;
//     if(error){
//         const msg = error.details.map(el => el.message).join(",")
//         // throw new ExpressError(msg, 400);
//         req.flash("error", msg);
//         // req.flash("error", "Review cant be empty");
//         res.redirect(`/campgrounds/${id}`)
//     } else{
//         next();
//     }
// }

// routes
router.post("", isLoggedin, validateReview, catchAsync(async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
        const newReview = new Reviews(req.body.review);
        newReview.author = req.user._id;
        campground.reviews.push(newReview)
        await campground.save()
        await newReview.save()
        req.flash("success", "Review posted");
        res.redirect(`/campgrounds/${id}`)
}))

router.delete("/:reviewId", isLoggedin, isReviewAuthor, catchAsync(async (req, res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}});
    await Reviews.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted");
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;