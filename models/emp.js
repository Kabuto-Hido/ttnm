const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmpSchema = new Schema({
    fullname:{
        type: String,
        required: [true, 'Name is required']
    },
    avatar: {
        type: String,
        default: "https://firebasestorage.googleapis.com/v0/b/cnpm-30771.appspot.com/o/no-user.png?alt=media&token=517e08ab-6aa4-42eb-9547-b1b10f17caf0"
    },
    year_experience: {
        type: Number,
        default: 1
    },
    email: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true
    },
    phone: {
        type: String,
        unique: true
    },
    address:{
        type: String
    },
    sex: {
        type: String,
        default: 'Men',
        enum:['Men', 'Woman', 'Other']
    },
    dateOfBirth:{
        type: String
    },
    forte: {
        type: String
    },
    position: {
        type: String,
        required: true
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

EmpSchema.virtual('articles', {
    ref: 'article',
    localField: '_id',
    foreignField: 'empId',
    justOne: false,
    count: true
});


module.exports = mongoose.model('employee', EmpSchema);