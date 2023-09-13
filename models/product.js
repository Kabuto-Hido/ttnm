const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
        default :"https://th.bing.com/th/id/R.a74e4f1154b754f9ba9d5973951c214a?rik=ESY2FoCJGVWrnQ&pid=ImgRaw&r=0"
    },
    description:{
        type: String
    },
    avg_rating: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default:'ACTIVE',
        enum: ['ACTIVE', 'NOT ACTIVE']
    },
    types:[{
        type: Schema.Types.ObjectId,
        ref: 'type'
    }],
    categoryId: {
        type: Schema.Types.ObjectId,
        ref:'category'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
},
{ toJSON: { virtuals: true }, toObject: { virtuals: true }});

ProductSchema.virtual('orderDetails', {
    ref: 'order_detail',
    localField: '_id',
    foreignField: 'productId',
    justOne: false,
    count: true
});

module.exports = mongoose.model('product', ProductSchema);