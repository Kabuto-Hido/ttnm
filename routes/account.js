const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Account = require('../models/account')
const bcrypt = require('bcryptjs')
const Customer = require('../models/customer')
require('dotenv').config()

//get all account
router.get('/get-all', verifyAdminRole, async (req,res) => {
    try {
        const listAccount = await Customer.find().sort({createAt:-1})
        .populate("accountId",["username","role","status"])
        if(!listAccount){
            return res
                .status(404)
                .json({success: false, message: 'No customer data!' })
        }
        res.json({success:true, listAccount: listAccount })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

//get account by id
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

//change status account
router.put("/changeStatus/:id", verifyAdminRole, async (req, res)=>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const account = await Account.findById({ _id: req.params.id })
        if(!user){
            return res.status(404).json({success: false,
                 message: 'Invalid ID!!'
            })
        }

        if(account.status === "ACTIVE"){
            account.status = "NOT ACTIVE"
        }
        else{
            account.status = "ACTIVE"
        }
        await account.save()
        const { password, __v, ...info } = account._doc
        return res.json({ success: true, info })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
} )

//change password
router.put('/change-password', verifyToken, async (req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body
    if(!oldPassword || !newPassword || !confirmPassword){
        return res.status(403).json({success: false, message:"Please enter all fields!"})
    }
    try {
        const account = await Account.findById(req.account.accountId)
        if(!account){
            return res.json({success: false, message: "Invalid account"})
        }
        const validPassword = await bcrypt.compare(oldPassword, account.password)
        if(!validPassword) {
            return res.json({success: false, message: "Old password is incorrect."})
        }
        if(await bcrypt.compare(newPassword, account.password)){
            return res.json({success: false, message: "New password is old password."})
        }
        if(confirmPassword !== newPassword) {
            return res.json({success: false, message: "Confirm password is incorrect"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        account.password = hashedPassword
        await account.save()
        return res.json({success: true, message:"Changed password successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router