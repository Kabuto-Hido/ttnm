const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        require: true
    },
    expireDate: {
        type: String,
        require: true,
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('discount', DiscountSchema);