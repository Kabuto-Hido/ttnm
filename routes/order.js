const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Order = require('../models/order')
const OrderDetail = require('../models/orderDetail')
const Customer = require('../models/customer')
const Discount = require('../models/discount')
const Cart = require('../models/cart')
const Type = require('../models/type')
const { route } = require('./cart')
require('dotenv').config()

async function checkInStock(listCart){
    var flag = true
    listCart.forEach(async cart => {
        const type = await Type.findById(cart.typeId)
        if(cart.quantity > type.in_stock){
            flag = false
            return false
        }
    })
    return flag
}

//order
router.post('/create', verifyToken, async (req, res) => {
    const customer = await Customer.findOne({accountId: req.account.accountId})
    
    if(!customer){
        return res.json({success: false, message:"Invalid customer"})
    }
    if(!req.body.address) {
        return res.json({success: false, message:"Invalid address"})
    }
    try {
        const listCart = await Cart.find({customerId: customer._id})
        if(listCart.length > 0){
            if(!checkInStock(listCart)){
                return res.json({status: false, message: 'Not enough quantity in stock'})
            }
            const order = new Order()
            var totalmoney = 0
            const discount = await Discount.findOne({code: req.body.discountCode})
            if(discount){
                totalmoney -= discount.discount
                order.discount_code = discount.id
            }

            if(req.body.phoneNumber){
                order.phoneNumber = req.body.phoneNumber
            } else{
                order.phoneNumber = customer.phone
            }
            
            order.address = req.body.address
            order.totalmoney = totalmoney
            order.customerId = customer.id
            await order.save()
            
            listCart.forEach(async (cart) => {
                totalmoney += cart.totalprice
                const orderDetails = new OrderDetail()
                orderDetails.quantity = cart.quantity
                orderDetails.totalprice = cart.totalprice
                orderDetails.unitprice = cart.unitprice
                orderDetails.productId = cart.productId
                orderDetails.orderId = order.id
                const type = await Type.findById(cart.typeId)
                type.in_stock -= 1
                await type.save()
                await orderDetails.save()
                await cart.deleteOne()
            })
            order.totalmoney = totalmoney > 0 ? totalmoney : 0
            await order.save()
            return res.json({success: true, order: order})
        }
        return res.json({success: false, message: 'Cart is empty'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
})

//get all orders by admin
router.get('/getAll', verifyAdminRole, async (req, res) => {
    const listOrder = await Order.find().sort({createAt: -1})
    if(listOrder.length <= 0){
        return res.json({success: false, message: 'Order is empty'})
    }
    return res.json({success: true, listOrder: listOrder})
})

//get all orders by user
router.get('/getAllByUser', verifyToken, async (req, res) => {
    const customer = await Customer.findOne({accountId: req.account.accountId})
    try {
        const listOrder = await Order.find({customerId: customer.id})
        if(listOrder.length <= 0){
            return res.json({success: false, message: 'Order is empty'})
        }
        return res.json({success: true, listOrder: listOrder})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
})

//order detail
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if(!order){
            return res.status(404).json({success: false, message: 'Order not found'})
        }

        const customer = await Customer.findOne({accountId: req.account.accountId})
        if(req.account.accountRole !== 'Admin' && customer.id !== order.customerId.toString()) {
            return res.status(400).json({message: 'No permission'})
        }

        const listOrderDetails = await OrderDetail.find({orderId: order.id})
        if(listOrderDetails.length <= 0){
            return res.json({success: false, message:'Order is empty'})
        }
        return res.json({success: true, listOrderDetails: listOrderDetails})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
})

//update status order
router.put('/updateStatus/:id', verifyAdminRole, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if(!order){
            return res.status(404).json({success: false, message: 'Order not found'})
        }
        if(order.status === 'Delivery successful'){
            return res.status(200).json({success: true, message:'The order has been delivered'})
        } else if(order.status === 'Waiting'){
            order.status = 'Delivering'
        } else if(order.status === 'Delivering'){
            order.status = 'Delivery successful'
        }
        await order.save()
        return res.json({success: true, order: order})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
})

//cancel order
router.put('/cancelOrder/:id', verifyToken, async (req, res) => {
    try {
        const customer = await Customer.findOne({accountId: req.account.accountId})
        const order = await Order.findById(req.params.id)
        if(!order) {
            return res.status(404).json({message: 'Order not found'})
        }
        if(req.account.accountRole !== 'Admin' && customer.id !== order.customerId.toString()) {
            return res.status(400).json({message: 'No permission'})
        }
        if(order.status !== 'Waiting'){
            return res.json({success: false, message: 'Cannot cancel order'})
        }
        order.status = 'Cancel'
        await order.save()
        return res.json({success: true, order: order})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }  
})

//get order by status 
router.get('/status/search', async (req, res) => {
    try {
        const listOrder = await Order.find({status: req.query.status})
        if(listOrder.length <= 0){
            return res.json({success: false, message: 'Order is empty'})
        }
        return res.json({success: true, listOrder: listOrder})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
})
module.exports = router