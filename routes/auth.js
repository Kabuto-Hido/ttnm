const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Account = require('../models/account')
const Customer = require('../models/customer')
const Employee = require('../models/emp')
const sendMail = require('../middlewares/mail_services')
require('dotenv').config()

//register new account for new customer
router.post('/register', async(req,res) => {
    const {username, password, reEnterPassword, fullname, sex, address, phone, dateOfBirth} = req.body

    if(!username || !password || !fullname || !address ||!phone ||!dateOfBirth || !sex ||!reEnterPassword){
        return res
            .status(400)
            .json({ success: false, message: 'Please enter full field!' })
    }

    const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
    var email = ""

    if(emailRegex.test(req.body.username)){
        email = req.body.username
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

        if(email !== ""){
            const checkEmail1 = await Customer.findOne({ email: req.body.email })
            const checkEmail2 = await Employee.findOne({ email: req.body.email })
            if (checkEmail1 || checkEmail2) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Email already exsisted!' })
            }
        }

        const checkPhone1 = await Customer.findOne({ email: req.body.phone })
        const checkPhone2 = await Employee.findOne({ email: req.body.phone })
        if (checkPhone1 || checkPhone2) {
            return res
                .status(400)
                .json({ success: false, message: 'Phone already exsisted!' })
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
            password: hashedPassword
        })
        await newAccount.save()

        const newCustomer = new Customer({
            fullname,
            email,
            address,
            dateOfBirth,
            phone,
            accountId: newAccount._id
        })
        await newCustomer.save()

        return res.json({ success: true, message: "Create account success!" })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

const generateAccessToken = (account) =>{
    return jwt.sign({
        accountId: account._id,
        accountRole: account.role
        }, 
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRE }
    )
}

const generateRefreshToken = (account) =>{
    return jwt.sign({
        accountId: account._id,
        accountRole: account.role
        }, 
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: "365d" }
    ) 
}

//login - customer
router.post('/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res
            .status(400)
            .json({ success: false, message: 'Enter full username and password!' })
    }

    try {
        const account = await Account.findOne({ username: req.body.username })
        if (!account) {
            return res
                .status(400)
                .json({ success: false, message: 'Incorrect username!' })
        }

        if (account.status === 'NOT ACTIVE') {
            return res
                .status(400)
                .json({ success: false, message: 'This account is blocked!' })
        }

        const validPassword = await bcrypt.compare(req.body.password, account.password);
        if (!validPassword) {
            return res
                .status(400)
                .json({ success: false, message: 'Incorrect password!' })
        }

        const accessToken = generateAccessToken(account)
        const refreshToken = generateRefreshToken(account)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict"
        })

        const customer = await Customer.find({ accountId: account._id })
        .populate("accountId",["username","role","status"])

        res.json({ success: true, customer, accessToken})

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 

})

//login - admin
router.post('/admin', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res
            .status(400)
            .json({ success: false, message: 'Enter full username and password!' })
    }

    try {
        const account = await Account.findOne({ username: req.body.username })
        if (!account) {
            return res
                .status(400)
                .json({ success: false, message: 'Incorrect username!' })
        }

        if (account.status === 'NOT ACTIVE') {
            return res
                .status(404)
                .json({ success: false, message: 'This account is blocked!' })
        }

        const validPassword = await bcrypt.compare(req.body.password, account.password);
        if (!validPassword) {
            return res
                .status(400)
                .json({ success: false, message: 'Incorrect password!' })
        }

        const accessToken = generateAccessToken(account)
        const refreshToken = generateRefreshToken(account)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict"
        })

        const emp = await Employee.find({ accountId: account._id })
        .populate("accountId",["username","role","status"])

        res.json({ success: true, emp, accessToken})

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 

})

router.post('/refresh', async (req,res) => {
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken) return res.status(400).json("Please login first!!")
    jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err,account) => {
        if(err){
            return res.status(403).send({success: false, message: "Token is not valid!!" })
        }
        const newAccessToken = generateAccessToken(account)
        const newRefreshToken = generateRefreshToken(account)
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict"
        })
        res.json({ success: true, newAccessToken})
    })
})

router.post("/sendmailotp", async (req, res) => {
    try {
        let otpCode = Math.floor(100000 + Math.random() * 900000).toString()
        let text = `Here is OTP code: <b>${otpCode}</b>`

        var accID =""

        const customer = await Customer.findOne({email: req.body.email})
        const employee = await Employee.findOne({email: req.body.email})
        if (!customer && !employee) {
            return res
                .status(400)
                .json({ success: false, message: 'Incorrect email!' })
        }
        else if(customer){
            accID = customer.accountId
        }
        else if(employee){
            accID = employee.accountId
        }

        const account = await Account.findById(accID)
        if(account.status !== "ACTIVE"){
            return res
                .status(400)
                .json({ success: false, message: `Account has email: ${req.body.email} is block!!` })
        }

        if (req.body.email !== undefined) {
            account.otp = otpCode
            await account.save()

            await sendMail(req.body.email, "Firehouse OTP code!", text)
            res.json({ success: true, accID})
        }

        else {res.json({ success: false, message: 'request body undefined' })}
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.put("/forgotpassword", async (req, res) => {
    try {

        const account = await Account.findById({ _id: req.query.id })

        if (!account.otp === req.body.otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }

        if (Object.keys(req.body.newPassword).length <= 6) {
            return res
                .status(400)
                .json({ success: false, message: 'Password must be longer than 7 character!' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.newPassword, salt)

        account.password = hashedPassword
        account.otp = ''
        await account.save()
        return res.json({ success: true, message: "Change password successful!!" })


    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.post('/logout', async (req,res) => {
    res.clearCookie("refreshToken")
    res.send("Logout successful!")
})

module.exports = router

