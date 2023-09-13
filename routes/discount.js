const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Discount = require('../models/discount')
require('dotenv').config()

//create discount
router.post("/create", verifyAdminRole, async (req, res) => {
    const { code, discount, expireDate } = req.body
    if (!code || !discount || !expireDate) {
        return res.status(400).json({ success: false, messsage: 'Enter full code, discount, expireDate.' })
    }

    const existDiscount = Discount.findOne({ code })
    if (existDiscount) {
        return res.status(400).json({ succsess: false, message: 'This discount is existed.' })
    }

    try {
        const discount = await Discount.create({ ...req.body })
        return res.json({ success: true, discount })
    } catch (error) {
        res.status(500).json(error)
    }
})

//get all discount
router.get("/getAll", async (req, res) => {
    try {
        const listDiscount = await Discount.find().sort({ createAt: -1 })
        if (listDiscount.length === 0) {
            console.log(1)
            return res.status(400).json({ success: false, message: 'There are no discount' })
        }
        return res.json({ success: true, listDiscount: listDiscount })
    } catch (error) {
        res.status(500).json(error)
    }
})

//get discount by id
router.get("/:id", async (req, res) => {
    console.log(req.params)
    if (!req.params.id) {
        return res.status(400).json({ success: false, message: 'Please enter a valid id' })
    }
    try {
        const discount = await Discount.findById(req.params.id)
        if (!discount) {
            return res.status(400).json({ success: false, message: 'Discount not found' })
        }
        return res.json({ success: true, discount: discount })
    } catch (error) {
        res.status(500).json(error)
    }
})

//edit discount
router.put("/edit/:id", verifyAdminRole, async (req, res) => {
    const { code, discount, expireDate } = req.body
    if (!code || !discount || !expireDate) {
        return res.status(400).json({ success: false, messsage: 'Enter full code, discount, expireDate.' })
    }
    try {
        const existDiscount = await Discount.findOne({ code: req.body.code })
        if (existDiscount && existDiscount.id != req.params.id) {
            return res.status(400).json({ success: false, message: 'This discount is existed by ' + code + '.' })
        }
        const fixDiscount = await Discount.findById(req.params.id)
        fixDiscount.discount = discount
        fixDiscount.expireDate = expireDate
        fixDiscount.code = code
        await fixDiscount.save()
        return res.json({ success: true, discount: fixDiscount })
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router