const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TypeSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    image:{
        type: String
    },
    in_stock:{
        type: Number,
        require: true,
        default: 1
    },
    price: {
        type: Number,
        require: true
    },
    sale: {
        type: String
    },
    sale_price: {
        type: Number
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref:'product'
    },
    status:{
        type: String,
        default:'ACTIVE',
        enum: ['ACTIVE', 'NOT ACTIVE']
    },
    createAt: {
        type: Date,
        default: Date.now
    }
    
})

module.exports = mongoose.model('type', TypeSchema);