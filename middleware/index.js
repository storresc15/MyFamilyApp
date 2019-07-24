var Blog = require("../models/blog");

module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    },
	//To be reviewed if it works
    checkUserBlog: function(req, res, next){
        console.log("YOU MADE IT!");
        if(req.isAuthenticated()){
                   next();  
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("login");
        }
    }
};