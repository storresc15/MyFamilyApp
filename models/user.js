var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var FamUserSchema = new mongoose.Schema({
    username: String,
    password: String
});

FamUserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("FamilyUser", FamUserSchema);