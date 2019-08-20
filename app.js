var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose = require("mongoose"),
cookieParser = require("cookie-parser"),
passport = require("passport"),
flash = require("connect-flash"),
LocalStrategy = require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose"),
Blog  = require("./models/blog"),
middleware = require("./middleware"),
session = require("express-session"),	
User = require("./models/user");
const PORT = process.env.PORT || 3000;

//APP CONFIG 
mongoose.connect('mongodb+srv://devsprout:devSebasTestSproutMongo@cluster0-v6jvy.mongodb.net/test?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	//The below url parser was deprecated
	//userNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log('Connected to DB');
}).catch(err => {
	console.log('Error: ', err.message);
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(cookieParser('secret'));

//Passport Configuration
app.use(require("express-session")({
    secret: "Tomoco is the best dog around",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

//RESTFULL ROUTES

app.get("/", function(req, res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err) {
            console.log("Error!");
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

//INDEX ROUTES: To be tested, then refactores to be placed on a different folder./////////////


//show login form
app.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/blogs",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
app.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "LOGGED YOU OUT!");
   res.redirect("/login");
});

///////REGISTER ROUTES//////////////////////////////
// show register form
app.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/blogs"); 
        });
    });
});



//MAIN BLOG ROUTES////////////////////////////////////
//Test this new route
app.get("/blogs/new",middleware.isLoggedIn, function(req, res){
    res.render("new");
});
//CREATE ROUTE
app.post("/blogs",middleware.isLoggedIn, function(req, res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
            //redirect to index
            res.redirect("/blogs");
        }
    });
});
//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit",middleware.isLoggedIn, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err) {
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id",middleware.isLoggedIn, function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id",middleware.isLoggedIn, function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(PORT, function() {
    console.log("The server has started!");
});