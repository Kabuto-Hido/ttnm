const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Category = require('../models/category')
const Product = require('../models/product')
const Type = require('../models/type')
const Cart = require('../models/cart')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { type } = require('os')
const { fail } = require('assert')
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

//upload image for product
router.post("/uploadImage/:id",upload.single('image'), verifyAdminRole, async(req,res) =>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    if(!req.file){
        return res.status(400).json({success: false,
            message: 'No images Selected!!' 
       })
    }
    try{
        const product = await Product.findById({ _id: req.params.id })
        if(!product){
            return res.status(404).json({success: false,
                 message: 'Invalid ID!!' 
            })
        }

        // Upload the image
        const result = await cloudinary.uploader.upload(req.file.path, options)
        //remove file from local
        removeTmp(req.file.path)

        product.image = result.secure_url
        await product.save().then((pro,err) => {
            if(!err){
                res.json({success:true, pro })
            }
        })

    }catch(error) {
        res.status(500).json(error)
    }
})

//create new product 
router.post("/createNew", verifyAdminRole, async(req,res) => {
    try {
        const category = await Category.findById(req.body.categoryId)
        if(!category){
            return res.status(400).json({success: false,
                message: `Category ${req.body.categoryId} not exist!!` })
        }

        const newProduct = new Product({
            name: req.body.name,
            image: req.body.image,
            description: req.body.description,
            categoryId: req.body.categoryId
        })
        await newProduct.save()

        if(req.body.types !== undefined){
            const listType = req.body.types
            if(listType.length > 0){
                var newType
                for(let i = 0; i < listType.length; i++){
                    newType = new Type({
                        name: listType[i].name ,
                        in_stock: listType[i].in_stock,
                        price: listType[i].price,
                        productId: newProduct._id
                    })
                    await newType.save()
    
                    newProduct.types.push(newType._id)
                    await newProduct.save()
                }
            }
        }
        res.json({success:true, newProduct })
        
    } catch (error) {
        res.status(500).json(error)
    }
})

//get all product
router.get("/get-all", async(req,res) => {

    try {
        const listProduct = await Product.find().sort({createAt:-1})
        .populate("types").populate("categoryId")
        if(listProduct.length === 0){
            return res
                .status(404)
                .json({success: false, message: 'No product data!' })
        }

        let results = listProduct

        const page = parseInt(req.query.page, 10) || 1
        const limit = parseInt(req.query.limit, 10) || 6
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        const total = results.length
        const totalPage = Math.ceil(total / limit)

        if (parseInt(req.query.limit) !== 0) {
            results = results.slice(startIndex, endIndex)
        }

        // Pagination result
        const pagination = {}

        if (endIndex < total) {
            pagination.next = {
            page: page + 1,
            limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
            page: page - 1,
            limit
            }
        }

        res.status(200).json({
            success: true,
            count: results.length,
            totalPage,
            pagination,
            data: results
        })
    } catch (error) {
        res.status(500).json(error)
    }
})

//get product by category id
router.get("/", async(req,res)=>{
    if(!req.query){
        return res.status(400).json({success: false,
            message: 'Please enter CATEGORY ID!!' 
       })
    }
    try {
        const listProduct = await Product.find({categoryId: req.query.categoryId})
        .sort({createDate:-1}).populate("categoryId").populate("types")
        
        if (listProduct.length === 0) {
            return res.status(404)
                .json({success: false, message: 'Invalid CATEGORY ID!!' })
        }
        let results = listProduct

        const page = parseInt(req.query.page, 10) || 1
        const limit = parseInt(req.query.limit, 10) || 6
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        const total = results.length
        const totalPage = Math.ceil(total / limit)

        if (parseInt(req.query.limit) !== 0) {
            results = results.slice(startIndex, endIndex)
        }

        // Pagination result
        const pagination = {}

        if (endIndex < total) {
            pagination.next = {
            page: page + 1,
            limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
            page: page - 1,
            limit
            }
        }

        res.status(200).json({
            success: true,
            count: results.length,
            totalPage,
            pagination,
            data: results
        })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//get related product 
router.get("/related/:id", async(req,res)=>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404)
                .json({success: false, message: 'Invalid ID!!' })
        }
        const listRelatedProduct = await Product.find({_id: {$ne: req.params.id}},
            {categoryId: product.categoryId}).limit(3)

        return res.json({ success: true, listRelatedProduct })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//get product by id
router.get("/:id", async(req,res)=>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const product = await Product.findById(req.params.id)
        .populate("types").populate("categoryId")
        if (!product) {
            return res.status(404)
                .json({success: false, message: 'Invalid ID!!' })
        }
        return res.json({ success: true, product })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

// edit product
router.put("/:id", verifyAdminRole, async(req,res) => {
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try {
        var product = await Product.findById(req.params.id)
        if(!product){
            return res.status(404).json({success: false,
                message: 'Invalid ID!!' })
        }

        const category = await Category.findById(req.body.categoryId)
        if(!category){
            return res.status(404).json({success: false,
                message: `Category ${req.body.categoryId} not exist!!` })
        }

        product.name = req.body.name
        product.image = req.body.image
        product.description = req.body.description;
        //product.status = req.body.status
        product.categoryId = req.body.categoryId

        await product.save()
        
        const listType = req.body.types

        for(let i = 0; i < listType.length; i++){
            if(!listType[i].id){
                var newType = new Type({
                    name: listType[i].name ,
                    in_stock: listType[i].in_stock,
                    price: listType[i].price,
                    productId: req.params.id
                })
                await newType.save()

                product.types.push(newType._id)
                await product.save()
            }
            else{
                const check = await Type.findById(listType[i].id)
                if(!check){
                    return res.status(400).json({success: false, error:`Type ${listType[i].id} not exsist!!`})
                }
                await Type.updateOne({_id: listType[i].id},
                    {"$set": {
                        name: listType[i].name,
                        in_stock: listType[i].in_stock,
                        price: listType[i].price
                    }})
            }
        }

        product = await Product.findById(req.params.id).populate("types").populate("categoryId")
        res.json({success:true, product})
        
    } catch (error) {
        res.status(500).json(error)
    }
})

router.put("/removeType/:id", verifyAdminRole, async(req,res) =>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try {
        let product = await Product.findById(req.params.id)
        if(!product){
            return res.status(404).json({success: false,
                message: 'Invalid ID!!' })
        }
        var listTypeId = req.body.typeId

        for(let i = 0; i < listTypeId.length; i++){
            let check = await Product.findOne({ 'types': listTypeId[i] , "_id": req.params.id})
            if(!check){
                return res.status(400).json({success: false, error:`Type ${listTypeId[i]} not exsist in ${product.name}!!`})
            }

            let checkProInCart = await Cart.find({typeId: listTypeId[i]})
            if(Object.keys(checkProInCart).length !== 0){
                return res.status(400).json({success: false, error:`Can not remove Type ${listTypeId[i]}!!`})
            }

            await Type.findByIdAndUpdate(
                {_id: listTypeId[i]},
                {$set: {productId:null}},
                {new: true}
            )
        }

        await Product.updateMany(
        {_id: req.params.id},
        {
            $pullAll:{types: listTypeId }
        }, {new: true})

        product = await Product.findById(req.params.id).populate("types").populate("categoryId")
        res.json({success:true, product})
        
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.put("/addType/:id", verifyAdminRole, async(req,res) =>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try {
        let product = await Product.findById(req.params.id)
        if(!product){
            return res.status(404).json({success: false,
                message: 'Invalid ID!!' })
        }
        var listTypeId = req.body.typeId

        for(let i = 0; i < listTypeId.length; i++){
            let type = await Type.findById(listTypeId[i])
            if(Object.keys(type).length === 0){
                return res.status(400).json({success: false, error:`Type ${listTypeId[i]} not exsist!!`})
            }

            if(type.productId !== null || type.productId !== undefined){
                return res.status(400).json({success: false, error:`Type ${listTypeId[i]} already in other product!!`})
            }
            
            await Type.findByIdAndUpdate(
                {_id: listTypeId[i]},
                {$set: {productId: req.params.id}},
                {new: true}
            )
        }

        await Product.updateMany(
        {
            _id: req.params.id
        },
        {
            $push:{
                types: listTypeId 
            }
        }, {new: true})

        product = await Product.findById(req.params.id).populate("types").populate("categoryId")
        res.json({success:true, product: product})
        
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router


