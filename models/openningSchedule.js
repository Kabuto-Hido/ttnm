const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OpenScheduleSchema = new Schema({
    open_time:{
        type: String,
        required: true
    },
    close_time: {
        type: String,
        required: true
    },
    open_day: {
        type: String
    }
});

module.exports = mongoose.model('opening_schedule', OpenScheduleSchema);