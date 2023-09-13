const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Menu = require('../models/menu')
const MenuItem = require('../models/menuItem')
const Product = require('../models/product')
const menuItem = require('../models/menuItem')
const { deleteMany } = require('../models/account')
require('dotenv').config()

router.post("/createNew", verifyAdminRole, async(req,res) => {
    const {food_name, price} = req.body

    if(!food_name || !price){
        return res
            .status(400)
            .json({ success: false, message: 'Please enter full field!' })
    }

    try {

        const checkName = await MenuItem.findOne({food_name: req.body.food_name})
        if(checkName){
            return res.status(400)
                .json({ success: false, message: `The name ${req.body.food_name} already exists!` })
        }

        const newMenuItem = new MenuItem({
            food_name,
            price
        })

        if(req.body.description){
            newMenuItem.description = req.body.description
        }
        await newMenuItem.save()

        res.json({ success: true, newMenuItem })
        
    } catch (error) {
        res.status(500).json(error)
    }
})

router.put("/:id", verifyAdminRole, async(req,res) =>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try{
        var menuItem = await MenuItem.findById(req.params.id)
        if(!menuItem){
            return res.status(400).json({success: false,
                message: 'Invalid ID!!' })
        }

        menuItem.food_name = req.body.food_name
        menuItem.price = req.body.price
        menuItem.description = req.body.description

        await type.menuItem()
        res.json({ success: true, menuItem })

    }catch(error){
        res.status(500).json(error)
    }
})

router.delete('/delete', verifyAdminRole, async(req,res) =>{
    const listId = req.body.listId
    try{
        for(let i = 0; i < listId.length; i++){
            var menuItem = await MenuItem.findById(listId[i])
            if(!menuItem){
                return res.status(400).json({success: false,
                    message: 'Invalid ID!!' })
            }
    
            const check = await Menu.find({item: listId[i]})
            if(check.length !== 0){
                return res.status(404).json({success: false,
                     message: `Must remove menuItem ${req.params.id} from Menu first!!`})
    
            }
        }
        await MenuItem.deleteMany({_id: { $in: listId}})
        return res.json({ success: true, message:"Delete successfully!!" });
    }catch(error){
        res.status(500).json(error)
    }
})

router.get("/get-all", async(req,res) => {
    try {
        const listMenuItem = await MenuItem.find().sort({createAt:-1})
        if(listMenuItem.length === 0){
            return res
                .status(404)
                .json({success: false, message: 'No data!' })
        }

        let results = listMenuItem

        const page = parseInt(req.query.page, 10) || 1
        const limit = parseInt(req.query.limit, 10) || 10
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
    } catch (error) {
        res.status(500).json(error)
    }
})

//get menuitem by id
router.get("/:id", async(req,res)=>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const menuitem = await MenuItem.findById(req.params.id)
        if (!menuitem) {
            return res.status(404)
                .json({success: false, message: 'Invalid ID!!' })
        }
        return res.json({ success: true, menuitem })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router