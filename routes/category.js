const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Category = require('../models/category')
const Product = require('../models/product')
require('dotenv').config()

//create new category
router.post("/createNew", verifyAdminRole, async(req,res) => {
    try {
        const category = await Category.create({...req.body})
        return res.json({ success: true, category })
    } catch (error) {
        res.status(500).json(error)
    }
})

//get all category
router.get("/get-all", async(req, res) => {
    try {
        const listCategory = await Category.find().sort({createAt:-1})
        if (!listCategory) {
            return res.status(404)
                .json({success: false, message: 'No category found!' })
        }
        return res.json({success:true, listCategory: listCategory })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//update infor category
router.put("/:id", verifyAdminRole, async(req, res) => {
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            context: 'query'
        })
        if(!category){
            return res.status(404).json({success: false,
                message: 'Invalid ID!!' })
        }
    return res.json({ success: true, category })
    } catch (error) {
        res.status(500).json(error)
    }
})

//get category by id
router.get("/:id", async(req,res)=>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404)
                .json({success: false, message: 'Invalid ID!!' })
        }
        return res.json({ success: true, category })
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
        // //find another category different category want delete
        // const newCategory = await Category.findOne({_id:{$nin:req.params.id}})
        // if(!newCategory){
        //     return res.status(400).json({success:false, message:"Can not delete this category!!"})
        // }
        // //change category for post that have category delete
        // await Post.updateMany({categoryId: req.params.id},{"$set":{categoryId:newCategory._id}})
        
        // Category.findByIdAndDelete(req.params.id, function (err, docs){
        //     if(err){
        //         res.status(500).json(err) 
        //     }
        //     else{
        //         res.json({ success: true,message:"Delete successfully"})
        //     }
        // })

        
        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404)
                .json({success: false, message: 'Invalid ID!!' })
        }

        if(category.status === "ACTIVE"){
            const listProduct = await Product.find({categoryId: req.params.id})
            if(listProduct.length > 0){
                return res.status(400)
                    .json({success:false, message:"There are products in use this category!!"})
            }

            category.status = "NOT ACTIVE"
        }
        else{
            category.status = "ACTIVE"
        }
        await category.save()
        return res.json({ success: true, category })

    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router