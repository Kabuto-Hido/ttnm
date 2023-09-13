const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Category = require('../models/category')
const Product = require('../models/product')
const Type = require('../models/type')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { type } = require('os')
const { fail } = require('assert')
const { isNullOrUndefined } = require('util')
const cloudinary = require('cloudinary').v2
require('dotenv').config()

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const upload = multer({
    storage : multer.diskStorage({
        destination: (req,file,cb)=>{
            cb(null,'./uploads/');
        },
        filename:function(req,file,callback){
            callback(null,file.fieldname + '-' + req.params.id + ".png")
        }         
    })
})

const removeTmp = (path) =>{
    fs.unlink(path, err=>{
        if(err) throw err;
    })
}

const options = {
    folder: "TTNM",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    height: 400,
    width: 400,
    crop: 'fill'
}

router.post("/createNew",upload.single("image"), verifyAdminRole, async(req,res) => {
    const {name, in_stock, price} = req.body

    if(!req.file){
        return res.status(400).json({success: false,
            message: 'No images Selected!!' 
       })
    }

    try {
        // Upload the image
        const result = await cloudinary.uploader.upload(req.file.path, options)
        //remove file from local
        removeTmp(req.file.path)

        const newType = new Type({
            name,
            image: result.secure_url,
            in_stock,
            price
        })

        await newType.save()

        res.json({ success: true, newType })
        
    } catch (error) {
        res.status(500).json(error)
    }
})

router.put("/:id", verifyAdminRole, upload.single("image"), async(req,res) =>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try{
        var type = await Type.findById(req.params.id)
        if(!type){
            return res.status(400).json({success: false,
                message: 'Invalid ID!!' })
        }

        const sale = req.body.sale
        var valueSale = sale.split("%")
        
        //0%
        if(valueSale[0] === "0"){
            type.sale_price = null
        }
        else{
            let sale_price = type.price * ((100 - valueSale[0])/100)
            type.sale_price = sale_price
        }
        
        type.name = req.body.name
        type.in_stock = req.body.in_stock
        type.price = req.body.price
        type.sale = req.body.sale
        
        if(req.file){
            // Upload the image
            const result = await cloudinary.uploader.upload(req.file.path, options)
            //remove file from local
            removeTmp(req.file.path)

            type.image = result.secure_url
        }

        await type.save()
        res.json({ success: true, type })

    }catch(error){
        res.status(500).json(error)
    }
})

//get all type
router.get("/get-all", async(req,res) => {

    try {
        const listType = await Type.find().sort({createAt:-1})
        if(!listType){
            return res
                .status(404)
                .json({success: false, message: 'No type data!' })
        }
        res.json({success:true, listType })
    } catch (error) {
        res.status(500).json(error)
    }
})

//get type has productId = null
router.get("/no-product/get", async(req,res) => {

    try {
        const listType = await Type.find({productId: null}).sort({createAt:-1})
        if(listType.length === 0){
            return res
                .status(404)
                .json({success: false, message: 'No data!' })
        }
        res.json({success:true, listType })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//get type by id
router.get("/:id", async(req,res)=>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const type = await Type.findById(req.params.id)
        if (!type) {
            return res.status(404)
                .json({success: false, message: 'Invalid ID!!' })
        }
        return res.json({ success: true, type })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//change status category
router.put('/:id',verifyAdminRole, async(req,res)=>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const type = await Type.findById(req.params.id)
        if (!type) {
            return res.status(404)
                .json({success: false, message: 'Invalid ID!!' })
        }

        if(type.status === "ACTIVE"){
            // const listProduct = await Product.find({categoryId: req.params.id})
            // if(listProduct.length > 0){
            //     return res.status(400)
            //         .json({success:false, message:"There are products in use this category!!"})
            // }

            type.status = "NOT ACTIVE"
        }
        else{
            type.status = "ACTIVE"
        }
        await type.save()
        return res.json({ success: true, type })

    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router
