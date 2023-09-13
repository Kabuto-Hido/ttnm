const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    // image: {
    //     type: String,
    //     required: true
    // },
    status: {
        type: String,
        default:'ACTIVE',
        enum: ['ACTIVE', 'NOT ACTIVE']
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('category', CategorySchema);