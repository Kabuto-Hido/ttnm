const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenuItemSchema = new Schema({
    food_name:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('menu_item', MenuItemSchema);