const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenuSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    item: [{
        type: Schema.Types.ObjectId,
        ref:'menu_item'
    }],
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('menu', MenuSchema);