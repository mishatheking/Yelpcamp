if (process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const catchAsync = require("../utils/catchAsyc");
const {isLoggedin, isAuthor, validateCampground} = require("../middleware");
const campgrounds = require("../controllers/campgrounds");

const multer = require("multer");
const {storage} = require("../cloudinary")
const upload = multer({storage});

const router = express.Router();



router.route("")
    .get(catchAsync( campgrounds.index)) //all
    .post(isLoggedin, upload.array("images"), validateCampground, catchAsync( campgrounds.createCampground));

// router.get("/new", isLoggedin, campgrounds.renderNewForm );
router.get("/new", isLoggedin, campgrounds.renderNewForm );

router.route("/:id")
    .get(catchAsync( campgrounds.showCampground )) //show
    .delete(isLoggedin, isAuthor, catchAsync( campgrounds.deleteCampground))
    .put(isLoggedin, upload.array("images"), validateCampground, catchAsync( campgrounds.updateCampground));

router.get("/:id/edit", isLoggedin, isAuthor, catchAsync( campgrounds.renderEditForm));
    
module.exports = router;

//all 
// router.get("", catchAsync( campgrounds.index))

// // new
// router.get("/new", isLoggedin, campgrounds.renderNewForm );
// router.post('', isLoggedin, validateCampground, catchAsync( campgrounds.createCampground));

// //show
// router.get("/:id", catchAsync( campgrounds.showCampground ));

// //delete
// router.delete('/:id', isLoggedin, isAuthor, catchAsync( campgrounds.deleteCampground));

// //update
// router.get("/:id/edit", isLoggedin, isAuthor, catchAsync( campgrounds.renderEditForm));
// router.put("/:id", validateCampground, catchAsync( campgrounds.updateCampground));
    