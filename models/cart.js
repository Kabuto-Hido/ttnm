const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    quantity:{
        type: Number,
        required: true,
        default: 1
    },
    unitprice: {
        type: Number,
        required: true,
    },
    totalprice:{
        type: Number,
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref:'product'
    },
    typeId: {
        type: Schema.Types.ObjectId,
        ref:'type'
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref:'customer'
    }
},
{ toJSON: { virtuals: true }, toObject: { virtuals: true }});

module.exports = mongoose.model('cart', CartSchema);