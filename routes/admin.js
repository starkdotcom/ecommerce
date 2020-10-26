const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/productHelpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/viewProducts',{admin:true,products})
  });
});
router.get('/addProducts',function(req,res){
  res.render('admin/addProducts',{admin:true})
});
router.get('/removeProducts',function(req,res){
  productHelpers.getAllProducts().then((products)=>{
   
    res.render('admin/removeProducts',{admin:true,products})
  });
  
});
router.post('/addProducts',(req,res)=>{
  console.log(req.body);
  console.log(req.files.image);
  productHelpers.addProducts(req.body,(id)=>{
    let image=req.files.image;
    console.log(id);
    image.mv('./public/productImages/'+id+'.png',(err)=>{
      if(!err){
      res.render('admin/addProducts',{admin:true})
      }
  else{
    console.log(err);
  }
})
  })
})
router.post('/removeProducts',(req,res)=>{
let p;
  if (Array.isArray (req.body.a))
{
   p=req.body.a;
}
else{
   p=[req.body.a];
}
console.log(p);

productHelpers.removeProducts(p,(err)=>{
     if(!err){
      productHelpers.getAllProducts().then((products)=>{
        res.render('admin/removeProducts',{admin:true,products})})
      }
      else{
        console.log(err);
      }
    console.log("Possibly Removed");
  })
})

router.get('/deleteProduct/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId)
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
})
router.get('/editProduct/:id',async (req,res)=>{
let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product);
    res.render('admin/editProduct',{product})
})
router.post('/editProduct',(req,res)=>{
  console.log(req.body)
  productHelpers.updateProduct(req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image=req.files.image
      let id=req.body.id
      image.mv('./public/productImages/'+id+'.png')
    }
  })
})

module.exports=router;