const express = require("express");
const User = require("../models/user")
const router = express.Router();
const catchAsync = require("../utils/catchAsyc")
const passport = require("passport");

router.get("/register", (req,res)=>{
    res.render("user/register")
})

router.post("/register", catchAsync( async(req, res)=>{
    try{
        const {username, email, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", `Welcome to yelpcamp ${username}`);
            res.redirect("/campgrounds");
        })
    }catch (e){
        req.flash("error", e.message);
        res.redirect("/register");
    }
}))

// log in
router.get("/login", (req,res)=>{
    res.render("user/login");
})

router.post('/login', passport.authenticate('local', {keepSessionInfo: true, failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Welcome back, ${req.user.username }`);
    const redirectUrl = req.session.returnTo || "/campgrounds";
    // console.log(req.session.returnTo);
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

// logout
// router.get("/logout", (req, res)=>{
//     req.logout();
//     req.flash("success", "Comeback soon");
//     res.redirect("/campgrounds");
// })

router.get("/logout", (req, res)=>{
    req.logout(function(err){
        if (err) { 
            req.flash("error", `${err.message}`);
            return res.redirect("/campgrounds");
        } else{
            req.flash("success", "Comeback soon");
            res.redirect("/campgrounds");
        }
    });
})


module.exports = router;