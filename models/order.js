const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    totalmoney: {
        type: Number,
        required: true
    },
    discount_code: [{
        type: Schema.Types.ObjectId,
        ref: 'discount'
    }],
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'customer'
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'booking'
    },
    address:{
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Waiting'
    },
    phoneNumber:{
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
},
{ toJSON: { virtuals: true }, toObject: { virtuals: true }});

module.exports = mongoose.model('order', OrderSchema);