const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cloudinary = require('cloudinary').v2
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Employee = require('../models/emp')
const Customer = require('../models/customer')
const Account = require('../models/account')
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

//get all employee
router.get('/get-all', async (req,res) => {
    try {
        const listEmp = await Employee.find().sort({createAt:-1})
        .populate("accountId",["username","role","status"])
        if(!listEmp){
            return res
                .status(404)
                .json({success: false, message: 'No employee data!' })
        }
        res.json({success:true, listEmp })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//get employee have no account
router.get('/no-account/get', async (req,res) => {
    try {
        const listEmp = await Employee.find({accountId: null}).sort({createAt:-1})
        if(listEmp.length === 0){
            return res
                .status(404)
                .json({success: false, message: 'No employee data!' })
        }
        res.json({success:true, listEmp })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//get employee by id
router.get('/information/:id', async (req,res) => {
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const employee = await Employee.findById(req.params.id)
        .populate("accountId",["username","role","status"])
        if(!employee){
            return res.status(404).json({success: false,
                 message: 'Invalid ID!!' 
            })
        }

        return res.json({ success: true, employee })

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})


router.post("/createNew", verifyAdminRole, async(req,res)=>{
    const {fullname, sex, year_experience, email, address, phone, forte, position, dateOfBirth} = req.body

    if(!fullname || !email || !phone || !dateOfBirth || !sex || !position){
        return res
            .status(400)
            .json({ success: false, message: 'Please enter full field!' })
    }

    const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
    if(!emailRegex.test(req.body.email)){
        return res
            .status(400)
            .json({ success: false, message: 'Please add a valid email!' })
    }

    const phoneRegex = new RegExp(/^$|^\d{10}$/);
    if(!phoneRegex.test(req.body.phone)){
        return res
            .status(400)
            .json({ success: false, message: 'Please add a valid phone number!' })
    }

    const birthdayRegex = new RegExp(/^(0[1-9]|1[0-9]|2[0-9]|3[0,1])([/+-])(0[1-9]|1[0-2])([/+-])(19|20)[0-9]{2}$/)
    if(!birthdayRegex.test(req.body.dateOfBirth)){
        return res
            .status(400)
            .json({ success: false, message: 'Please add a valid birthday!' })
    }

    try {
        const checkEmail1 = await Customer.findOne({ email: req.body.email })
        const checkEmail2 = await Employee.findOne({ email: req.body.email })
        if (checkEmail1 || checkEmail2) {
            return res
                .status(400)
                .json({ success: false, message: 'Email already exsisted!' })
        }

        const checkPhone1 = await Customer.findOne({ email: req.body.phone })
        const checkPhone2 = await Employee.findOne({ email: req.body.phone })
        if (checkPhone1 || checkPhone2) {
            return res
                .status(400)
                .json({ success: false, message: 'Phone already exsisted!' })
        }

        const newEmployee = await Employee.create({...req.body})

        return res.json({ success: true, message: "Create employee success!", newEmployee })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//change persional information , upload.single('avatar')
router.put('/changeProfile/:id',verifyAdminRole, upload.single('avatar'), async(req,res) =>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try {
        const employee = await Employee.findById({ _id: req.params.id })
        if(!employee){
            return res.status(404).json({success: false,
                 message: 'Invalid ID!!' 
            })
        }

        if(req.file){
            const resultAvatar = await cloudinary.uploader.upload(req.file.path, options)
            removeTmp(req.file.path)

            employee.avatar = resultAvatar.secure_url
        }
        
        employee.fullname = req.body.fullname
        employee.sex = req.body.sex
        employee.email = req.body.email
        employee.phone = req.body.phone
        employee.address = req.body.address
        employee.dateOfBirth = req.body.dateOfBirth

        if(req.body.forte){
            employee.forte = req.body.forte
        }

        await employee.save()
        return res.json({ success: true, employee })

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.post("/newAccount", verifyAdminRole, async(req,res)=>{
    const {username, password, reEnterPassword} = req.body
    if(!username || !password || !reEnterPassword){
        return res
            .status(400)
            .json({ success: false, message: 'Please enter full field!' })
    }

    if (Object.keys(password).length <= 6) {
        return res
            .status(400)
            .json({ success: false, message: 'Password must be longer than 7 character!' })
    }

    if (Object.keys(username).length < 5) {
        return res
            .status(400)
            .json({ success: false, message: 'Username must be longer than 5 character!' })
    }

    try {
        const checkUsername = await Account.findOne({ username: req.body.username })
        if (checkUsername) {
            return res
                .status(400)
                .json({ success: false, message: 'Username already exsisted!' })
        }

        if(Object.keys(password).toString !== Object.keys(reEnterPassword).toString){
            return res
                .status(400)
                .json({ success: false, message: 'The two password not same!' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const newAccount = new Account({
            username,
            password: hashedPassword,
            role: "Admin"
        })
        await newAccount.save()

        const emp = await Employee.findByIdAndUpdate(
            {_id: req.body.empId},
            {$set: {accountId: newAccount._id}},
            {new: true}
        ).populate("accountId",["username","role","status"])

        return res.json({ success: true, message: "Create account success!" ,emp})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }

})
module.exports = router
