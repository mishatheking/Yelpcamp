const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
    
    email:{
        type : String,
        unique : true,
        required : true    
    }
})

userSchema.plugin(passportLocalMongoose); //implements username and password fields


module.exports = mongoose.model('User', userSchema )