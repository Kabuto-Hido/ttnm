const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cloudinary = require('cloudinary').v2
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Customer = require('../models/customer')
require('dotenv').config()

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const options = {
    folder: "TTNM",
    use_filename: true,
    unique_filename: false,
    overwrite: true
}

//get all customer - admin
router.get('/get-all', verifyAdminRole, async (req,res) => {
    try {
        const listCus = await Customer.find().sort({createAt:-1})
        .populate("accountId",["username","role","status"])
        if(!listCus){
            return res
                .status(404)
                .json({success: false, message: 'No customer data!' })
        }
        res.json({success:true, listCus: listCus })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//get customer by id
router.get('/information/:id', verifyToken, async (req,res) => {
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const customer = await Customer.findById(req.params.id)
        .populate("accountId",["username","role","status"])
        if(!customer){
            return res.status(404).json({success: false,
                 message: 'Invalid ID!!' 
            })
        }

        return res.json({ success: true, customer })

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
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

//change persional information , upload.single('avatar')
router.put('/changeProfile/:id',verifyToken,
             upload.fields([{name: "avatar", maxCount: 1}, {name: "background", maxCount: 1}]), async(req,res) =>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try {
        const customer = await Customer.findById({ _id: req.params.id })
        if(!customer){
            return res.status(404).json({success: false,
                 message: 'Invalid ID!!' 
            })
        }

        if(req.files.avatar){
            const resultAvatar = await cloudinary.uploader.upload(req.files.avatar[0].path, options)
            removeTmp(req.files.avatar[0].path)

            customer.avatar = resultAvatar.secure_url
        }
        
        if(req.files.background){
            const resultBackground = await cloudinary.uploader.upload(req.files.background[0].path, options)
            removeTmp(req.files.background[0].path)

            customer.background = resultBackground.secure_url
        }
        
        customer.fullname = req.body.fullname
        customer.sex = req.body.sex
        customer.email = req.body.email
        customer.phone = req.body.phone
        customer.address = req.body.address
        customer.dateOfBirth = req.body.dateOfBirth

        await customer.save()
        return res.json({ success: true, customer })

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router
