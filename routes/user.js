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
router.get('/verifyLogin',verifyLogin,(req,res,next)=>{
  res.session.redirectUrl='/'
  res.json({stat:true})
})
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
  res.render('user/home', {user,cartCount});
  /*productHelpers.getAllProducts().then((products)=>{
    
  });*/
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
  userId=req.session.user._id
  }
  else{userId=null}
productHelpers.getAllProducts(userId).then((products)=>{
    
    res.render('user/products', {products,user,cartCount});
  })
})
router.post('/products/searchProd',async function(req,res,next){
  let user=req.session.user
  let cartCount=null
  let wishlist
  let searchProd=req.body.searchProd
  if(user){
    /*  userHelpers.checkWishList(user._id).then((products)=>{
        wishlist=products
      }).catch()*/
    userHelpers.getCartCount(user._id).then((response)=>{
      cartCount=response
    }).catch(()=>{
      cartCount=0
    })
    userId=req.session.user._id
    }
    else{userId=null}
  productHelpers.getSearchProducts(userId,searchProd).then((products)=>{
      console.log(products);
      res.render('user/products', {products,user,cartCount});
    })
})
router.get('/product/:id',async(req,res)=>{
  let id=req.params.id
  let user=req.session.user
  var wlist
  console.log(id);
  if(user){
    userHelpers.checkWishList(user._id).then((products)=>{
        products.forEach(element => {
          if((""+element)==(""+id)){
            wlist=true
          }
        });
      }).catch(()=>{wlist=false})}
  let prod=await userHelpers.getProductDetails(id).then((response)=>{
    console.log(response.product);
    res.render('user/product',{product:response.product,user,wlist})
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
  userHelpers.getCartCount(user._id).then((response)=>{
    cartCount=response
  }).catch(()=>{
    cartCount=0
  })
  userHelpers.getAddress(user._id).then((response)=>{
  let addr=response
  console.log(addr);
  res.render('user/profile',{user,cartCount,addr})
  }).catch(()=>{
    res.render('user/profile',{user,cartCount})
  })
})
router.get('/profile/addAddress',verifyLogin,async(req,res,next)=>{
  let user=req.session.user
  let cartCount=null
  res.render('user/addAddress',{user})
})
router.post('/profile/addAddress',verifyLogin,async (req,res,next)=>{
  userId=req.session.user._id
  address=req.body
  console.log(address);
  userHelpers.addAddress(address,userId).then((response)=>{
    if(response){
      res.redirect('/profile')
    }
    else{
      res.json({stat:false})
    }
  })
})
router.get('/profile/updateAddress/:addr',verifyLogin,async(req,res,next)=>{
  user=req.session.user
  let address=req.params.addr
  console.log(address);
  let addr=await userHelpers.getAddr(user._id,address).then((addr)=>{
  console.log("Address to be updated",addr);
  res.render('user/updateAddress',{user,addr,index:address})}).catch(()=>{console.log("ERRRRRRROOOOOOORRRRRR");
  res.render('user/profile',{user})})
 
})
router.post('/profile/updateAddress/:index',verifyLogin,(req,res,next)=>{
  userId=req.session.user._id
  index=req.params.index
  addr=req.body
  console.log(addr);
  userHelpers.updateAddress(userId,addr,index).then((response)=>{
    res.redirect('/profile')
  }).catch(()=>{
    console.log("UpdateError");
  })
  
})
router.get('/profile/removeAddress/:index',verifyLogin,(req,res,next)=>{
  userId=req.session.user._id
  index=req.params.index
  addr=req.body
  console.log(addr);
  userHelpers.removeAddress(userId,addr,index).then((response)=>{
    res.redirect('/profile')
  }).catch(()=>{
    console.log("Removing Error");
  })
  
})

router.get('/wishList',verifyLogin,async function(req, res, next){
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
