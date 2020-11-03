const { response, Router } = require('express');
var express = require('express');
const { resolve } = require('promise');
var router = express.Router();
var productHelpers = require('../helpers/productHelpers');
const userHelpers = require('../helpers/userHelpers');

const verifyLogin=(req,res,next)=>{

  if(req.session.userLoggedIn){
    return next()
  }
  else{
    req.session.redirectUrl = req.url;
     res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  let cartCount=null
  if(user){
  userHelpers.getCartCount(user._id).then((response)=>{
    cartCount=response
  }).catch(()=>{
    cartCount=0
  })
  }
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/home', {products,user,cartCount});
  });
});
router.get('/products',async function(req, res, next) {
  let user=req.session.user
  let cartCount=null
  let wishlist
  if(user){
  /*  userHelpers.checkWishList(user._id).then((products)=>{
      wishlist=products
    }).catch()*/
  userHelpers.getCartCount(user._id).then((response)=>{
    cartCount=response
  }).catch(()=>{
    cartCount=0
  })
  }/*
  products.forEach(element => {
    wishlist
    if(element._id==) 
  });*/
if(user) userId=req.session.user._id
else userId = null
  productHelpers.getAllProducts(userId).then((products)=>{
    
    res.render('user/products', {products,user,cartCount});
  })
})
router.get('/product/:id',async(req,res)=>{
  let id=req.params.id
  console.log(id);
  let prod=await userHelpers.getProductDetails(id).then((response)=>{
    console.log(response.product);
    res.render('user/product',{product:response.product})
  })

})
router.get('/addToWishList/:id',verifyLogin,async(req,res)=>{
let proId=req.params.id
let userId=req.session.user._id 
  console.log("Api Calll")
  userHelpers.addToWishList(proId,userId).then((stat)=>{
  response.stat=stat
  console.log(response.stat);
    res.json(response)
  })})
router.get('/profile',verifyLogin,async function(req, res, next) {
  let user=req.session.user
  let cartCount=null
  if(user){
  userHelpers.getCartCount(user._id).then((response)=>{
    cartCount=response
  }).catch(()=>{
    cartCount=0
  })
  res.render('user/profile',{user,cartCount})
}
})
router.get('/wishList',verifyLogin,async function(req, res, next) {
  let user=req.session.user
  let list =await userHelpers.getUserWishList(user._id)
  console.log(list);
  res.render('user/wishList',{user,list})
  
})

router.get('/cart',verifyLogin,async function(req,res,next){
  let user=req.session.user
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let total=await userHelpers.getCartTotal(user._id)
  res.render('user/cart',{products,user,total});
})
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  let id=req.params.id
  let userId=req.session.user._id 
  console.log("Api Calllllllllllllllll")
  userHelpers.addToCart(id,userId).then(()=>{
   res.json({stat:true})
  })
})
router.post('/changeProdQuant',(req,res)=>{
  let proId=req.body.product
  let cartId=req.body.cart
  let count=req.body.count
  let quantity=req.body.quantity
  userHelpers.changeProdQuant(proId,cartId,count,quantity).then((response)=>{
    userHelpers.getCartTotal(req.session.user._id).then((total)=>{
      response.total=total
      console.log(response);
      res.json(response)
    })
     
  })
})
router.get('/placeOrder',verifyLogin,async(req,res)=>{
  user=req.session.user
 // console.log(req.body);
  let total=await userHelpers.getCartTotal(user._id)
  res.render('user/placeOrder',{total,user})
})
router.post('/placeOrder',async(req,res)=>{
  console.log("Order",req.body);
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getCartTotal(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((order)=>{
    if(req.body.paymentMethod==='COD'){
    res.json({codSuccess:true})}
    else{   
      console.log(order);
      userHelpers.generateRazorpay(order).then((response)=>{
      
        res.json(response)})
    }
  })
  //res.render('user/orders')
})
router.post('/verifyPayment',(req,res)=>{
  console.log("PaymentVerification",req.body);
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStat(req.body['order[receipt]']).then(()=>{
      console.log("success");
      res.json({stat:true})

    })
  }).catch(()=>{
    console.log("failed");
    res.json({stat:false})
  })
})
router.get('/placedOrder',verifyLogin,(req,res)=>{
  res.render('user/placedOrder',{user:req.session.user} )
})
router.get('/orders',verifyLogin,async (req,res)=>{
  let user=req.session.user

   let orders=await userHelpers.getUserOrders(user._id)
  // let products= await userHelpers.getOrderProd(req.body.orderId)
  if(orders[0]){ 
  console.log(orders[0].products);
  }
  res.render('user/orders',{user:req.session.user,orders})
})
router.post('/viewOrderedProd',async(req,res)=>{
  
 
  let products= await userHelpers.getOrderProd(req.body.orderId)
  console.log(products);
  res.json(products)
})
module.exports = router;
