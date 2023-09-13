const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Category = require('../models/category')
const Product = require('../models/product')
const Type = require('../models/type')
const Cart = require('../models/cart')
const Customer = require('../models/customer')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { type } = require('os')
const { fail } = require('assert')
const cloudinary = require('cloudinary').v2
require('dotenv').config()

//add product to cart
router.post("/addtocart", verifyToken, async(req, res) =>{
    const customer = await Customer.findOne({accountId: req.account.accountId})
    const type = await Type.findById(req.body.typeId)
    if(!type){
        return res.status(400).json({success: false,
            message: 'Invalid typeID!!' 
       })
    }

    const product = await Product.findById(type.productId)
    if(!product){
        return res.status(400).json({success: false,
            message: 'Invalid productID!!' 
       })
    }

    const checkItemIncart = await Cart.findOne({
        customerId: customer._id,
        typeId: req.body.typeId})
    
    if(checkItemIncart){
        return res.status(400).json({success: false,
            message: 'Product already in your cart!!' 
       })
    }

    if(req.body.quantity > type.in_stock){
        return res.status(404).json({success: false,
            message: 'Exceed the quantity in stock!!' 
       })
    }

    let totalprice = type.price * req.body.quantity
    
    const cart = new Cart({
        quantity: req.body.quantity,
        unitprice: type.price,
        totalprice: totalprice,
        typeId: req.body.typeId,
        productId: type.productId,
        customerId: customer._id
    })

    await cart.save()
    res.json({success:true, message:"Add to cart success" })
})

//view cart
router.get("/viewcart", verifyToken, async(req, res) =>{
    const customer = await Customer.findOne({accountId: req.account.accountId})
    const cartDetails = await Cart.find({customerId: customer._id})
                                .populate("productId",["name","image"])
                                .populate("typeId",["name","image","price","sale","sale_price","in_stock"])

    var totalMoney = 0
    for(let i = 0; i < cartDetails.length; i++){
        totalMoney += cartDetails[i].totalprice
    }

    if(cartDetails.length === 0){
        return res.json({success: true,
            message: 'Your cart is empty!!'})
    }

    res.json({success:true, cartDetails, totalMoney})
})

//update cart
router.put("/update-quantity", verifyToken, async(req,res) =>{
    const cartDetails = req.body.cartDetails

    const customer = await Customer.findOne({accountId: req.account.accountId})

    for(let i=0; i < cartDetails.length; i++){
        const type = await Type.findById(cartDetails[i].typeId)
        if(!type){
            return res.status(400).json({success: false,
                message: `TypeID ${cartDetails[i].typeId} is invalid!!` 
            })
        }

        const product = await Product.findById(type.productId)

        const cartEdit = await Cart.findOne({
            customerId: customer._id,
            typeId: cartDetails[i].typeId
        })

        if(!cartEdit){
            return res.status(404).json({success: false,
                message: `Product ${type.name} not in your cart` 
            })
        }

        if(cartDetails[i].quantity > type.in_stock){
            return res.status(404).json({success: false,
                message: `The maximum quantity of product ${type.name} is ${type.in_stock}` 
            }) 
        }

        let totalprice = type.price * cartDetails[i].quantity
        cartEdit.quantity = cartDetails[i].quantity
        cartEdit.totalprice = totalprice
        cartEdit.unitprice = type.price

        await cartEdit.save()
    }
    const cart = await Cart.find({customerId: customer._id})
                            .populate("productId",["name","image"])
                            .populate("typeId",["name","image","price","sale","sale_price"])

    var totalMoney = 0
    for(let i = 0; i < cart.length; i++){
        totalMoney += cart[i].totalprice
    }
    res.json({success:true, "cartDetails": cart , totalMoney})
})

router.put("/removeitem",verifyToken, async(req, res)=>{
    const listID = req.body.id
    const customer = await Customer.findOne({accountId: req.account.accountId})

    for(let i = 0; i < listID.length; i++){
        const type = await Type.findById(listID[i])
        if(!type){
            return res.status(400).json({success: false,
                message: `TypeID ${listID[i]} is invalid!!` 
            })
        }

        const product = await Product.findById(type.productId)

        const itemInCart = await Cart.findOne({
            customerId: customer._id,
            typeId: listID[i]})

        if(!itemInCart){
            return res.status(404).json({success: false,
                message: `Product ${product.name} not in your cart` 
            })
        }

        await Cart.deleteOne({_id: itemInCart._id})
    }

    const cart = await Cart.find({customerId: customer._id})
                            .populate("productId",["name","image"])
                            .populate("typeId",["name","image","price","sale","sale_price"])

    var totalMoney = 0
    for(let i = 0; i < cart.length; i++){
        totalMoney += cart[i].totalprice
    }
    if(cart.length === 0){
        return res.json({success: true,
            message: 'Your cart is empty!!'})
    }
    else{
        res.json({success:true, "cartDetails": cart , totalMoney})
    }
    
})

module.exports = router
