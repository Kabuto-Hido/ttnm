const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderDetailSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref:'product'
    },
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
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'order'
    },
    typeId: {
        type: Schema.Types.ObjectId,
        ref:'type'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('order_detail', OrderDetailSchema);