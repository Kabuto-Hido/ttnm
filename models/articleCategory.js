const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleCategorySchema = new Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

ArticleCategorySchema.virtual('articles', {
    ref: 'article',
    localField: '_id',
    foreignField: 'articleCateId',
    justOne: false,
    count: true
});

module.exports = mongoose.model('article_category', ArticleCategorySchema);