//jshint esversion:6
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
   secret: "any string of your choice",
   resave: false,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://admin-arjun:test123@cluster0.afqgc.mongodb.net/skillsDB", { useNewUrlParser: true ,  useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GitHubStrategy({
    clientID: process.env.GIT_CLIENT_ID,
    clientSecret: process.env.GIT_CLIENT_SECRET,
    // callbackURL: "http://localhost:3000/auth/github/topSkills"
    callbackURL:"https://mysterious-island-25455.herokuapp.com/auth/github/topSkills"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ username: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // callbackURL: "http://localhost:3000/auth/google/topSkills"
    callbackURL:"https://mysterious-island-25455.herokuapp.com/auth/google/topSkills"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ username: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//routes
app.get('/', function(req, res){
  res.render('home');
});


app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/topSkills',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/topSkills');
  });



app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/topSkills',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/topSkills');
  });

app.get('/register', function(req,res){
  res.render('register');
});

app.get('/login', function(req,res){
  res.render('login');
});

app.get('/topSkills', function(req,res){
  if(req.isAuthenticated()){
    res.render('topSkills');
  }
  else
  {
    res.redirect('/login');
  }
});

app.get('/logout', function(req,res){
  req.logout();     //using passport logout functionality to deauthenticate the user
  res.redirect('/');
});

app.post('/register', function(req,res){

  //using register from passport-local-mongoose
  User.register({username: req.body.username, email: req.body.username, password:req.body.password, name: req.body.Name}, req.body.password, function(err,user){
    if(err)
    {
      console.log(err);
      res.redirect('/register');
    }
    else
    {
      passport.authenticate('local')(req, res, function(){
        res.redirect('/topSkills');
      });
    }
  });


});

app.post('/login', function(req,res){

  const newUser = new User({
    username: req.body.username,
    password: req.body.password
  });

  //using login method of passport to check if that user is present in the database or not
  //from the passport documentation
  req.login(newUser, function(err){
    if(err)
      console.log(err);
    else
    {
      passport.authenticate('local')(req,res,function(){
        res.redirect('/topSkills');
      });
    }
  });


});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log('Server is up and running');
});
fsdfsdf
