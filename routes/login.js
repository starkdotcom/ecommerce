const { response } = require('express');
var express = require('express');
const { reset } = require('nodemon');
var router = express.Router();
const userview=require('./user')
const userHelpers=require('../helpers/userHelpers');
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
     req.redirect('/login')
  }
}

router.get('/', function(req, res, next) {
  if(req.session.loggedIn){
    res.redirect('/')
  }
  else{
    res.render('account/login',{"loginErr":req.session.loginErr});
    req.session.loginErr=null;
  }
  });
 
router.get('/register', function(req, res, next) {
    res.render('account/registration',{'signupErr':req.session.signupErr});
    req.session.signupErr=null
}); 
router.post('/register',function(req,res,next){
userHelpers.doSignup(req.body).then((response,reject)=>{
if (response){
  req.session.loggedIn=true
  req.session.user=response
  res.redirect('/')
}
else {
  req.session.signupErr="Email Id already Exists";
  res.redirect('/login/register')
}

})
})
router.post('/',(req,res,next)=>{
  console.log(req.body);
userHelpers.doLogin(req.body).then((response)=>{
  console.log(response);
  if(response.status){
    req.session.loggedIn=true
    req.session.user=response.user
    
    res.redirect('/')
  }
  else{
    req.session.loginErr="Invalid Username or Password"
    res.redirect('/login')
  }
})
})
router.get('/signout', function(req, res, next) {
  req.session.destroy()
  res.redirect('/');
})
  
  module.exports = router;