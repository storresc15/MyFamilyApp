var mongoose = require("mongoose");

var FblogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("FamilyBlog", FblogSchema);