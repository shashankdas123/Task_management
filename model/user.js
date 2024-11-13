const mongoose=require("mongoose");
const Schema= mongoose.Schema;
const passportLocalMogoose = require("passport-local-mongoose");
const userSchema=new Schema ({
    email: {
        type : String,
        required : true
    }
});

userSchema.plugin(passportLocalMogoose);

module.exports=mongoose.model("User",userSchema)