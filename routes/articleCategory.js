const express = require('express')
const router = express.Router()
const { verifyAdminRole } = require('../middlewares/jwt_service')
const ArticleCategory = require('../models/articleCategory')
require('dotenv').config()

//create article category
router.post('/create', verifyAdminRole, async (req, res) => {
    try {
        if(!req.body.name || !req.body.description){
            return res.status(400).json({success: false, message: 'Please provide name and description'})
        }
        const existCategory = await ArticleCategory.findOne({name: req.body.name})
        if(existCategory){
            return res.status(409).json({success: false, message: 'Article category already exists by name: '+ existCategory.name})
        }
        const articleCategory = await ArticleCategory.create({...req.body})
        return res.json({success: true, articleCategory: articleCategory})
    } catch (error) {
        res.status(500).json(error)
    }
})

//get all article categories
router.get('/getAll', async (req, res) =>{
    try {
        const articleCategorys = await ArticleCategory.find().sort({name: 1})
        if(articleCategorys.length === 0){
            return res.status(404).json({success: false, message: 'No article category found'})
        }
        return res.json({success: true, articleCategorys: articleCategorys})
    } catch (error) {
        console.log(console.error)
        return res.status(500).json(error)
    }
})

//get by id
router.get('/:id', async (req, res) => {
    try {
        const articleCategory = await ArticleCategory.findById(req.params.id)
        if(!articleCategory){
            return res.status(404).json({success: false, message: 'No article category found'})
        }
        return res.json({success: true, articleCategory: articleCategory})
    } catch (error) {
        console.log(console.error)
        return res.status(500).json(error)
    }
})

//edit
router.put('/edit/:id', verifyAdminRole, async (req, res) => {
    const {name, description} = req.body
    try {
        const articleCategory = await ArticleCategory.findById(req.params.id)
        if(!articleCategory){
            return res.status(404).json({success: false, message: 'No article category found'})
        }
        if(!name || !description){
            return res.status(400).json({success: false, message: 'Article category name and description are required'})
        }
        const category = await ArticleCategory.findOne({name: name})
        if(category && category != articleCategory){
            return res.status(409).json({success: false, message: 'Article category already exists by name: '+ category.name})
        }
        articleCategory.name = req.body.name
        articleCategory.description = req.body.description
        await articleCategory.save()
        return res.json({success: true, articleCategory: articleCategory})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

module.exports = router