const mongoose = require("mongoose");
const Campground = require("./models/campground")
const {places, descriptors } = require("./seeds/seedHelpers");
const cities = require("./seeds/cities")

async function main() {
    await mongoose.connect("mongodb://localhost:27017/yelpcamp");
  }
  
main()
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const sample = array => array[Math.floor( Math.random()*array.length)];


 const seedDB = async ()=>{
     await Campground.deleteMany({});
     console.log("DB Cleared");
     for(let i = 0; i < 200; i++){
        const random1000 = Math.floor(Math.random() *1000);
        const camp = new Campground({
        title : `${sample(descriptors)} ${sample(places)}`,
        author : '63271c6e28b2147afa27a41b',
        location : `${cities[random1000].city}, ${cities[random1000].state}`,
        price : 25,
        geometry : {
            type : "Point",
            coordinates : [
                cities[random1000].longitude,
                cities[random1000].longitude 
            ]
        },
        description : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, illo, veniam temporibus culpa sit impedit libero esse minima quod, molestiae id! Illo unde corporis, nam saepe accusamus reprehenderit! Sit, beatae?",
        images: [ 
            { "url" : "https://res.cloudinary.com/dvoymf3j8/image/upload/v1664729709/YelpCamp/mjbiv7t9edkefpyjsns7.jpg", "filename" : "YelpCamp/mjbiv7t9edkefpyjsns7" }, 
            { "url" : "https://res.cloudinary.com/dvoymf3j8/image/upload/v1664729709/YelpCamp/qhdjd4rzdrb7uzwhan7p.jpg", "filename" : "YelpCamp/qhdjd4rzdrb7uzwhan7p" } 
                ]
        })
        // console.log(camp.image)
        await camp.save()
         }
 };

 seedDB().then(()=>{
     console.log("DB Seeded")
     db.close();
     console.log("Database closed");
 }

 )
