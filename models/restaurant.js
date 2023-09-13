const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
    home_des:{
        type: String
    },
    aboutUs_des: {
        type: String
    },
    content: {
        type: String
    },
    banner_slidebar_des: {
        type: String
    }
});

module.exports = mongoose.model('restaurant', RestaurantSchema);