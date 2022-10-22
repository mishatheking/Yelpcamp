const mongoose =require("mongoose");

const Schema = mongoose.Schema
const reviewSchema = new Schema({
    author:{
        type : Schema.Types.ObjectId,
        ref: "User"
    },
    body: String,
    rating: String
})

module.exports = mongoose.model('Review', reviewSchema )