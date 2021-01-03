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

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//routes
app.get('/', function(req, res){
  res.render('home');
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

app.listen(3000, function(){
  console.log('function is up and running at port 3000');
});
