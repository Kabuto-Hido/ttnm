const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Restaurant = require('../models/restaurant')
const ImgRestaurant = require('../models/imageRes')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
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
            callback(null,file.fieldname +'-'+Date.now() +".png")
        }         
    })
})

const removeTmp = (path) =>{
    fs.unlink(path, err=>{
        if(err) throw err;
    })
}

router.put("/home", upload.single("banner_top_home") , verifyAdminRole, async(req,res)=>{
    if(!req.body.home_des || !req.body.content){
        return res
            .status(400)
            .json({ success: false, message: 'Please enter full field!' })
    }
    
    if(!req.file){
        return res.status(400).json({success: false,
            message: 'No images Selected!!' 
       })
    }

    try {
        var check = await Restaurant.find()
        var checkImg = await ImgRestaurant.findOne({type_name: "banner_top_home"})
        var resultRes
        if(check.length === 0){
            resultRes = new Restaurant({
                home_des: req.body.home_des,
                content: req.body.content
            })
        }
        else{
            var idRestaurant = check[0]._id
            resultRes = await Restaurant.findById(idRestaurant)
            if(req.body.home_des !== ""){
                resultRes.home_des = req.body.home_des
            }
            if(req.body.content !== ""){
                resultRes.content = req.body.content
            }
        }
        await resultRes.save()

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "TTNM",
            public_id: "banner_top_home",
            overwrite: true
        })
        removeTmp(req.file.path)
        if(checkImg === null){
            checkImg = new ImgRestaurant({
                type_name: "banner_top_home",
                image: result.secure_url
            }) 
        }
        else{
            checkImg.image = result.secure_url
        }
        await checkImg.save()

        return res.json({success: true,
            restaurant: resultRes , homeImg: checkImg
       })
        
    } catch (error) {
        res.status(500).json(error)
    }

})

router.put("/banner", upload.fields([{name:"banner_section", maxCount:1}, {name:"banner_slidebar", maxCount:5}]),
             verifyAdminRole, async(req,res)=>{
    if(!req.body.banner_slidebar_des){
        return res
            .status(400)
            .json({ success: false, message: 'Please enter full field!' })
    }
    
    if(!req.files){
        return res.status(400).json({success: false,
            message: 'No images Selected!!' 
       })
    }

    try {
        const restaurant = await Restaurant.find()
        var imgSlidebar = await ImgRestaurant.findOne({type_name: "banner_slidebar"})
        var imgSection = await ImgRestaurant.findOne({type_name: "banner_section"})

        var idRestaurant = restaurant[0]._id
        const editRes = await Restaurant.findById(idRestaurant)
        editRes.banner_slidebar_des = req.body.banner_slidebar_des
        await editRes.save()

        if(req.files.banner_section){
            const resultSection = await cloudinary.uploader.upload(req.files.banner_section[0].path, 
                {
                    folder: "TTNM",
                    public_id: "banner_section",
                    overwrite: true
                })
            removeTmp(req.files.banner_section[0].path)

            if(imgSection !== null){
                imgSection.image = resultSection.secure_url
            }
            else{
                imgSection = new ImgRestaurant({
                    type_name: "banner_section",
                    image: resultSection.secure_url
                })
            }
            imgSection.save()
        }

        if(req.files.banner_slidebar){
            const files = req.files.banner_slidebar
            var len = files.length
            const urls =[]
            for (const file of files) {
                const { path } = file;
                const result = await cloudinary.uploader.upload(path, 
                    {
                        folder: "TTNM",
                        public_id: "banner_slidebar_"+ len,
                        overwrite: true
                    })
                len = len - 1
                urls.push(result.secure_url)
                removeTmp(path)
            }
            if(imgSlidebar !== null){
                imgSlidebar.image = urls
            }
            else{
                imgSlidebar = new ImgRestaurant({
                    type_name: "banner_slidebar",
                    image: urls
                })
            }
            await imgSlidebar.save()
        }
       
        return res.json({success: true,
            restaurant: editRes ,sliderbarImg: imgSlidebar,
            sectionImg: imgSection
       })
        
        
    } catch (error) {
        res.status(500).json(error)
    }

})

router.put("/about-us", upload.single("aboutus_avatar") , verifyAdminRole, async(req,res)=>{
    if(!req.body.aboutUs_des){
        return res
            .status(400)
            .json({ success: false, message: 'Please enter full field!' })
    }
    
    if(!req.file){
        return res.status(400).json({success: false,
            message: 'No images Selected!!' 
       })
    }

    try {
        const restaurant = await Restaurant.find()
        var img = await ImgRestaurant.findOne({type_name: "aboutus_avatar"})

        var idRestaurant = restaurant[0]._id
        const editRes = await Restaurant.findById(idRestaurant)
        editRes.aboutUs_des = req.body.aboutUs_des
        await editRes.save()

        const result = await cloudinary.uploader.upload(req.file.path,
        {
            folder: "TTNM",
            public_id: "aboutus_avatar",
            overwrite: true
        })
        removeTmp(req.file.path)

        if(img !== null){
            img.image = result.secure_url
        }
        else{
            img = new ImgRestaurant({
                type_name: "banner_slidebar",
                image: result.secure_url
            })
        }
        await img.save()
       
        return res.json({success: true,
            restaurant: editRes , aboutusImg: img
       })
        

        
    } catch (error) {
        res.status(500).json(error)
    }

})

module.exports = router