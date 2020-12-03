const mongodb = require('mongodb').ObjectID;
const fs = require('fs')
var db = require('../config/connection')
var collection=require('../config/collection');
const { PRODUCT_COLLECTION } = require('../config/collection');
var userHelpers = require('./userHelpers')
const strcmp=require('strcmp')
const { resolve } = require('path');
const { ObjectId } = require('mongodb');
const { UnavailableForLegalReasons } = require('http-errors');
module.exports={
    
addProducts:(product,callback)=>
    {  
    db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
    callback(data.ops[0]._id)
    });
    },
getProductDetails:(proId)=>{
return new Promise((resolve,reject)=>{
 db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)}).then((product)=>{
     resolve(product)
 })
})
}, 
updateProduct:(proDetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(proDetails.id)},{
            $set:{
                name:proDetails.name,
                description:proDetails.description,
                price:proDetails.price,
                tags:proDetails.tags,

            }
        }).then((response)=>{
            resolve()
        })
    })
},
removeProducts:(product,callback)=>
    { 
    var p=product;
    var i;
    console.log(p);
    //function call
    for(i=0;i<p.length;i++){
       deleteListingById(p[i]);
       console.log("IDS :",p[i]);
    }
    //function for deleting data
    function deleteListingById(id) {
       let path = './public/productImages/'+id+'.png'
        console.log(path)
        //trying to remove image before deleting from database
        try {
            fs.unlinkSync(path)
            console.log("Removed image");
            //file removed
          } 
        catch(err) {
            console.error(err)
        }
    //Deletion Query
    result = db.get().collection(collection.PRODUCT_COLLECTION, function(err, obj) {
    //Passing delete by id as obj of db.collection
        obj.deleteOne({_id: new mongodb.ObjectID(id)},function(err, results) {
        if (err){
          console.log("failed");
          throw err;
        }
        console.log("success");
        })
    })
    //End of delete funtion
    }   

   callback();
    
},
getAllProducts:(userId)=>{
    return new Promise(async (resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
         if(userId){
             console.log("user:",userId);
            await userHelpers.checkWishList(userId).then((prod)=>{
                //console.log(prod);
                products.forEach(element => {
                    element.wlist=false
                    prod.forEach(ele=>{
                      
                       let str1= ""+element._id
                       let str2= ""+ele
                       console.log("list:",str2);
                       console.log("Prod:",str1);
                        if(str1==str2){
                            element.wlist=true
                        } })
                        console.log(element.wlist);})
                       // console.log(products);
                        resolve (products);
                }).catch(()=>{
                    resolve(products)
                })
            }
            resolve(products)
               // products.wlist=products.some(v =>{ prod.includes(v);
                console.log(products)
              //})/*.catch(products.wlist=false)*/}
             
    })
},
deleteProduct:(proId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:mongodb.ObjectID(proId)}).then((response)=>{
        let path = './public/productImages/'+proId+'.png'
        console.log(path)
        //trying to remove image before deleting from database
        try {
            fs.unlinkSync(path)
            console.log("Removed image");
            //file removed
          } 
        catch(err) {
            console.error(err)
        } resolve(response.name)
       })
   }) 
},
getSearchProducts:(userId,searchProd)=>{
    return new Promise(async (resolve,reject)=>{
        let search=searchProd+""
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({$text:{$search:search,$caseSensitive: false}})/*.sort( { score: { $meta: "textScore" } } )/*[
            {name: {$regex:".*"+search+".*",'$options':'i'}},
        {tags:{$regex:".*"+search+".*"}},
           { description:{$regex:".*"+search+".*"}}
    ]}}})*/.toArray();
         if(userId){
             console.log("user:",userId);
            await userHelpers.checkWishList(userId).then((prod)=>{
                //console.log(prod);
                products.forEach(element => {
                    element.wlist=false
                    prod.forEach(ele=>{
                      
                       let str1= ""+element._id
                       let str2= ""+ele
                       console.log("list:",str2);
                       console.log("Prod:",str1);
                        if(str1==str2){
                            element.wlist=true
                        } })
                        console.log(element.wlist);})
                       // console.log(products);
                        resolve (products);
                }).catch(()=>{
                    resolve(products)
                })
            }
            resolve(products)     
    })

   
}
}
