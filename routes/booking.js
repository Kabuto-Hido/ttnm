const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Booking = require('../models/booking')
const Customer = require('../models/customer')
require('dotenv').config()

router.post('/user-booking', verifyToken, async (req, res) => {
    const {bookingDate, time, amount_of_people, note} = req.body
    if(!bookingDate || !time || !amount_of_people){
        return res.status(400).json({success: false, message: 'Please fill all fields'})
    }
    try {
        const booking = new Booking({bookingDate, amount_of_people, time, note})
        const customer = await Customer.findOne({accountId: req.account.accountId})
        booking.customerId = customer.id
        await booking.save()
        return res.json({success: true, booking: booking})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

router.get('/getAll', verifyAdminRole, async (req, res) => {
    const query = {}
    if(req.body.status){
        query.status = req.body.status
    }
    if(req.body.phone && req.body.phone.length > 0){
        const customer = await Customer.findOne({phone: req.body.phone})
        if(customer){
            query.customerId = customer.id
        }
    }
    try {
        const bookings = await Booking.find(query)
        if(bookings.length === 0){
            return res.status(404).json({success: false, message: "No bookings found"})
        }
        return res.json({success: true, bookings: bookings})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
        if(!booking){
            return res.status(404).json({success: false, message: 'Booking not found'})
        }
        const customer = await Customer.findOne({accountId: req.account.accountId})
        
        if(req.account.accountRole !== 'Admin' && customer.id !== booking.customerId.toString()) {
            return res.status(400).json({message: 'No permission'})
        }
        return res.json({success: true, booking: booking})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

router.put('/edit/:id', verifyToken, async (req, res) => {
    const {bookingDate, time, amount_of_people, note, status} = req.body
    if(!bookingDate || !time || !amount_of_people){
        return res.status(400).json({success: false, message: 'Please fill all fields'})
    }
    try {
        const booking = await Booking.findById(req.params.id)
        const customer = await Customer.findOne({accountId: req.account.accountId})
        if(!booking){
            return res.status(404).json({status: false, message: 'Booking not found'})
        }
        if(req.account.accountRole !== 'Admin' && customer.id !== booking.customerId.toString()) {
            return res.status(400).json({message: 'No permission'})
        }
        if(booking.status !== 'WAITING' && req.account.accountRole !== 'Admin'){
            return res.json({success: false, message: "Can't edit this booking"})
        }
        booking.bookingDate = bookingDate
        booking.status = status
        booking.time = time
        booking.amount_of_people = amount_of_people
        booking.note = note
        await booking.save()
        return res.status(200).json({success: true, booking: booking})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})
module.exports = router