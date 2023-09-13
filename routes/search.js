const express = require('express')
const router = express.Router()
const Article = require('../models/article')
const Product = require('../models/product')
require('dotenv').config()

router.get('/product', async(req,res) => {
    const keyword = req.query.keyword

    var listProduct = await Product.find(
        {
            name:{$regex: keyword, $options:'i'}
        }
    ).sort({createAt:-1}).populate("types").populate("categoryId")
    
    let results = listProduct

    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 6
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = results.length
    const totalPage = Math.ceil(total / limit)

    if (parseInt(req.query.limit) !== 0) {
        results = results.slice(startIndex, endIndex)
    }

    // Pagination result
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
        page: page + 1,
        limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
        page: page - 1,
        limit
        }
    }

    res.status(200).json({
        success: true,
        count: results.length,
        totalPage,
        pagination,
        data: results
    })
})

router.get('/article', async(req,res) => {
    const keyword = req.query.keyword

    var listArticle = await Article.find({
        $or:[
            {title:{$regex: keyword, $options:'si'}},
            {description:{$regex: keyword, $options:'si'}}
        ]
    }).sort({createAt:-1}).populate("empId").populate("articleCateId")
    
    let results = listArticle

    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 6
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = results.length
    const totalPage = Math.ceil(total / limit)

    if (parseInt(req.query.limit) !== 0) {
        results = results.slice(startIndex, endIndex)
    }

    // Pagination result
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
        page: page + 1,
        limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
        page: page - 1,
        limit
        }
    }

    res.status(200).json({
        success: true,
        count: results.length,
        totalPage,
        pagination,
        data: results
    })
})

module.exports = router
