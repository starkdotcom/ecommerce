var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { resolve, reject } = require('promise')
const { ObjectID } = require('mongodb').ObjectID
const { response } = require('express')
const { CART_COLLECTION } = require('../config/collection')
const { use } = require('../routes/user')
const Razorpay=require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_P5OE1d50cFS40Q',
    key_secret: 'LmOhtBA41PTqWn9vo6fHGIfv',
  });
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let emailIdValid = await db.get().collection(collection.USER_COLLECTION).findOne({ "email": userData.email })
            let response = {}
            if (emailIdValid != null) {
                response.stat = false
                resolve(response.stat)
            }
            else {
                userData.password = await bcrypt.hash(userData.password, 10)
                await db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data.ops[0])
                })
            }
        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.stat = true
                        resolve(response)
                    }
                    else {
                        console.log('login failed');
                        resolve({ stat: false })
                    }
                })
            }
            else {
                console.log('login failled');
                resolve({ stat: false })
            }
        })
    },
    addToWishList:(proId,userId)=>{
        proObj = {
            item: ObjectID(proId),
        }
        return new Promise(async (resolve, reject) => {
            var wishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectID(userId) });
            if (wishList) {
                let proExist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectID(userId) ,'products.item': ObjectID(proId) })
                if (proExist) {
                    db.get().collection(collection.WISHLIST_COLLECTION).removeOne({ user: ObjectID(userId), 'products.item': ObjectID(proId) }).then(() => {
                            resolve(false)
                        })
                }
                else {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: ObjectID(userId) },
                        { $push: { products: proObj } }
                    ).then((response) => {
                        resolve(true)
                    })
                }
            }

            else {
                wishObj = {
                    user: ObjectID(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(
                    wishObj).then(() => {
                        resolve(true)
                    })
            }
        })
    },
    getUserWishList:(userId)=>{
        return new Promise(async (resolve, reject) => {

            let list = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: ObjectID(userId) },
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
                console.log(list);
            resolve(list)
        })

    },
    addToCart: (proId, userId) => {
        proObj = {
            item: ObjectID(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            var userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) });
            if (userCart) {
                let proExist = userCart.products.findIndex(products => products.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ 'user': ObjectID(userId), 'products.item': ObjectID(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                }
                else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectID(userId) },
                        { $push: { products: proObj } }
                    ).then((response) => {
                        resolve(response)
                    })
                }
            }

            else {
                cartObj = {
                    user: ObjectID(userId),
                    products: [proObj]
                }
                db.get().collection(CART_COLLECTION).insertOne(
                    cartObj).then(() => {
                        resolve()
                    })
            }
        })
    },

    /*
  var cart =await col.findOne({
      user: userId
    , "products.item": proId,
    });
   
    if(cart){
      await col.updateOne({
          user: userId
        , "products.item": proId
        
      }, {
        $inc: {"products.$.quantity": 1}
      });
    }*/
    /*
    let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({_id: ObjectID(userId)})
    if (userCart){
        let count=null
        let cartProd=await db.get().collection(collection.CART_COLLECTION).findOne({_id:ObjectID(userId)},{$match:{products:[proId,count]}}) 
        if(cartProd){
            await db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectID(userId)},
            {$match:{products:[[proId,{$sum:1}]]} }
            ).then((response)=>{
                resolve(response)
            })  
        }
        else{
            let count=1
        await db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectID(userId)},
        {$push:{products:[[proId,count]]} }
        ).then((response)=>{
            resolve(response)
        })}
    }
    else{
        let count=1
        let cartObj={
            _id:ObjectID(userId),
            products:[[proId,count]]
        }
        await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
            resolve()
        })
    }*/
    //  })
    // },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {

            let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectID(userId) },
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()

            resolve(cart)


        })
    },
    getCartTotal: (userId) => {
        return new Promise(async (resolve, reject) => {
            //   userCart=await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) });
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectID(userId) },
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] } }
                    }
                }
            ]).toArray()
           // console.log(total);
            if (total[0]) {
                resolve(total[0].total)
            }
            resolve(parseInt(0))



        })
    },
    checkWishList:(userId) => {
        return new Promise(async (resolve, reject) => {
            var wishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectID(userId)})
            if(wishList){
                var proId=[]
                wishList.products.forEach(ele => {
                    proId.push(ele.item)    
                   });
                resolve(proId)
            }
            reject()
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            var userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) })
            
//****Must be REPLACED*****    should use db functions instead of below forEach loop

            if (userCart) {
                var cnt=0;
                //console.log(userCart.products);
                userCart.products.forEach(ele => {
                 cnt=cnt+ele.quantity    
                });
            resolve(cnt)}
            else{reject()}
          })
    },
    changeProdQuant(proId, cartId, count, quantity) {
        return new Promise((resolve, reject) => {
            quantity = parseInt(quantity)
            count = parseInt(count)
            if ((count == -1 && quantity == 1) | (count == -(quantity))) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ '_id': ObjectID(cartId) },
                    {
                        $pull: { products: { item: ObjectID(proId) } }
                    }).then((response) => {
                        response = { removeProduct: true }
                        resolve(response)
                    })
            }
            else {
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    '_id': ObjectID(cartId),
                    'products.item': ObjectID(proId)
                },
                    {
                        $inc: { 'products.$.quantity': count }
                    }).then((response) => {
                        response = { removeProduct: false }
                        resolve(response)
                    })

            }
        })



    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, total);
            let status = order.paymentMethod === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetais: {
                    mobile: order.phone,
                    address: order.address,
                    city: order.city,
                    state: order.state,
                    pincode: order.zip,
                },
                userId: ObjectID(order.userId),
                paymentMethod: order.paymentMethod,
                products: products,
                total: total,
                status: status,
                date: new Date(),
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {

                db.get().collection(collection.CART_COLLECTION).removeOne({ user: ObjectID(order.userId) }).then(() => {
                    resolve(response.ops[0])
                })
            })
        })
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            var cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) })
        
            resolve(cart.products)

        })
    },
    getProductDetails:(proId)=>{
        return new Promise(async (resolve, reject) => {
            
            var prod=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectID(proId)})
                console.log(prod);
                resolve({product:prod})
        
    })},
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {

            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectID(userId) }).toArray()
            console.log(orders);
            resolve(orders)
        })
    },
    getOrderProd: (orderId) => {
        return new Promise(async (resolve, reject) => {

            let productsList = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                { $match: { _id: ObjectID(orderId) }, },
            { $unwind: '$products' }, 
            {
                $project: {
                    item: '$products.item', quantity: '$products.quantity'
                }
            },
            {
                $lookup: 
                { 
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                     as: 'product'
                }
            },
             {
                $project: {
                     product: { $arrayElemAt: ['$product', 0] } } 
            }]).toArray()
           
            resolve(productsList)


        })
    },
    generateRazorpay:(orderObj)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount: orderObj.total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderObj._id
              };
              instance.orders.create(options, function(err, order) {
                //console.log("Order:",order);
                resolve(order)
              });
        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto=require('crypto')
            const secret='LmOhtBA41PTqWn9vo6fHGIfv'
            
               let hmac=crypto.createHmac('sha256',secret)
               hmac.update(details['order[id]']+'|'+details['payment[razorpay_payment_id]'])
               hmac=hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {

                resolve()
              }
              else{

                  reject()
              }
        })
    },
    changePaymentStat:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectID(orderId)},
            {$set:{status:'placed'}})
        .then(()=>{
            resolve()
        })
        })
    }
}