
const Campground = require("../models/campground");
const {cloudinary} = require("../cloudinary/index");

const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeoCoding({accessToken : mapBoxToken});

//all 
module.exports.index = async (req,res) => {
    const campgrounds =  await Campground.find({});
    res.render("campgrounds/campgrounds",{campgrounds})
}
// new

module.exports.renderNewForm = (req,res) => {
    res.render("campgrounds/new")
}

module.exports.createCampground = async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url : f.path, filename : f.filename })); // assigning req.fileS to f and getting url and path from it 
    campground.author = req.user._id;
    const geodata = await geocoder.forwardGeocode({query: req.body.campground.location,limit: 1 }).send();
    campground.geometry = geodata.body.features[0].geometry;
    await campground.save();
    req.flash("success", "Campground created");
    res.redirect(`/campgrounds/${campground._id}`);
}

//show
module.exports.showCampground = async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author'}}).populate("author");
    if(!campground){
        req.flash("error", "Campground not found");
        return res.redirect('/campgrounds');
    };
    // console.log(JSON.stringify(campground));
    // console.log(campground); 
    res.render("campgrounds/show",{campground })
}

//delete
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash("success", `${camp.title} Campground deleted`);
    res.redirect('/campgrounds');
}

//update
module.exports.renderEditForm = async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash("error", "Campground not found");
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit",{campground})
}

module.exports.updateCampground = async (req,res)=>{
    const { deleteImages } =  req.body;
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    if (req.files){
        const imgs = req.files.map(f => ({url : f.path, filename : f.filename }));   
        campground.images.push(...imgs);
        await campground.save()
    };
    
    try{
        if (req.body.deleteImages){
            await campground.updateOne({$pull : {images : { filename : {$in : req.body.deleteImages}}}});
            console.log("deleted from mongo");
            for (let filename of req.body.deleteImages){
                await cloudinary.uploader.destroy(filename);
                console.log("deleted from cloud");
            };
        };
    }catch(e){
        res.send(e);
    }
    req.flash("success", "Campground updated");
    res.redirect(`/campgrounds/${campground.id}`);
}
