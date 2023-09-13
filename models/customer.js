const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CusSchema = new Schema({
    fullname:{
        type: String,
        required: [true, 'Name is required']
    },
    avatar: {
        type: String,
        default: "https://firebasestorage.googleapis.com/v0/b/cnpm-30771.appspot.com/o/no-user.png?alt=media&token=517e08ab-6aa4-42eb-9547-b1b10f17caf0"
    },
    background: {
        type: String,
        default: "https://artsmidnorthcoast.com/wp-content/uploads/2014/05/no-image-available-icon-6.png"
    },
    email: {
        type: String,
        //required: true,
        unique: true,
        uniqueCaseInsensitive: true
    },
    phone: {
        type: String,
        unique: true
    },
    dateOfBirth:{
        type: String,
        required: true
    },
    sex: {
        type: String,
        default: 'Men',
        enum:['Men', 'Woman', 'Other']
    },
    address: {
        type: String
    },
    cusType: {
        type: String,
        default: "Bronze",
        enum:['Bronze', 'Silver', 'Gold']
    },
    point: {
        type: Number,
        default: 0
    },
    accountId:{
        type: Schema.Types.ObjectId,
        ref: 'account'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

CusSchema.virtual('bookings', {
    ref: 'booking',
    localField: '_id',
    foreignField: 'customerId',
    justOne: false,
    count: true
});

CusSchema.virtual('carts', {
    ref: 'cart',
    localField: '_id',
    foreignField: 'customerId',
    justOne: false,
    count: true
});

CusSchema.virtual('orders', {
    ref: 'order',
    localField: '_id',
    foreignField: 'customerId',
    justOne: false,
    count: true
});

module.exports = mongoose.model('customer', CusSchema);
