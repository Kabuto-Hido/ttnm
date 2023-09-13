const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    type_name:{
        type: String,
        required: true
    },
    image: [{
        type: String,
        required: true
    }],
    description: {
        type: String
    }
});

module.exports = mongoose.model('restaurant_image', ImageSchema);