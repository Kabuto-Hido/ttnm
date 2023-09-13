const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    bookingDate: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'WAITING',
        enum: ['WAITING', 'SUCCESS', 'FAILURE']
    },
    time:{
        type: String,
        required: true
    },
    amount_of_people: {
        type: Number,
        required: true,
        default: 1
    },
    note: {
        type: String
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'customer'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
},
{ toJSON: { virtuals: true }, toObject: { virtuals: true }});

module.exports = mongoose.model('booking', BookingSchema);