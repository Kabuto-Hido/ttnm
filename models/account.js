const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        default: 'User',
        enum: ['User', 'Admin']
    },
    status: {
        type: String,
        default:'ACTIVE',
        enum: ['ACTIVE', 'NOT ACTIVE']
    },
    otp:{
        type: String,
         default:''
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('account', AccountSchema);