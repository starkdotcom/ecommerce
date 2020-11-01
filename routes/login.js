const { response } = require('express');
var express = require('express');
const { reset } = require('nodemon');
var router = express.Router();
const userview=require('./user')
const userHelpers=require('../helpers/userHelpers');
const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }
  else{
     req.redirect('/login')
  }
}

router.get('/', function(req, res, next) {
  if(req.session.user){
    res.redirect('/')
  }
 
  else{
    res.render('account/login',{"loginErr":req.session.loginErr});
    req.session.loginErr=null;
  }})

  router.post('/',(req,res,next)=>{
    console.log(req.body);
  userHelpers.doLogin(req.body).then((response)=>{
    console.log(response);
    if(response.stat){
     // response.userLoggedIn=true
     if (req.session.redirectUrl) {
      redirectUrl = req.session.redirectUrl;
      req.session.redirectUrl = null;
    }
      req.session.user=response.user
      req.session.userLoggedIn=true
      
      res.redirect(redirectUrl)
    }
    else{
      req.session.loginErr="Invalid Username or Password"
      res.redirect('/login')
    }
  })
  })

  
router.get('/register', function(req, res, next) {
    res.render('account/registration',{'signupErr':req.session.signupErr});
    req.session.signupErr=null
}); 
router.post('/register',function(req,res,next){
userHelpers.doSignup(req.body).then((response,reject)=>{
if (response){
  req.session.user=response
  req.session.userLoggedIn=true
  res.redirect('/')
}
else {
  req.session.signupErr="Email Id already Exists";
  res.redirect('/login/register')
}})})
router.get('/signout', function(req, res, next) {
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/');
})
  
  module.exports = router;