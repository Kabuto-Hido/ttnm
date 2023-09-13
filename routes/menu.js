const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const Menu = require('../models/menu')
const MenuItem = require('../models/menuItem')
const Product = require('../models/product')
require('dotenv').config()

router.post('/createNew', verifyAdminRole, async(req,res) => {
    if(!req.body.name){
        return res
            .status(400)
            .json({ success: false, message: 'Please enter name of menu!' })
    }

    try {
        const checkNameInMenu = await Menu.findOne({name: req.body.name})
        if(checkNameInMenu){
            return res.status(400)
                .json({ success: false, message: `The name ${req.body.name} already exists!` })
        }

        const newMenu = new Menu({
            name: req.body.name
        })
        await newMenu.save()

        if(req.body.items !== undefined){
            const listMenuItem = req.body.items
            if(listMenuItem.length > 0){
                var newMenuItem
                for(let i = 0; i < listMenuItem.length; i++){
                    const checkNameInItem = await MenuItem.findOne({food_name: listMenuItem[i].food_name})
                    if(checkNameInItem){
                        return res.status(400)
                            .json({ success: false, message: `The food name ${listMenuItem[i].food_name} already exists!` })
                    }
    
                    newMenuItem = new MenuItem({
                        food_name: listMenuItem[i].food_name,
                        description: listMenuItem[i].description,
                        price: listMenuItem[i].price,
                    })
                    await newMenuItem.save()
    
                    newMenu.item.push(newMenuItem._id)
                    await newMenu.save()
                }
            }
        }
        res.json({success: true, newMenu})
    } catch (error) {
        res.status(500).json(error)
    }
})

router.put('/:id', verifyAdminRole, async(req,res) => {
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try {
        var menu = await Menu.findById(req.params.id)
        if(!menu){
            return res.status(404).json({success: false,
                message: 'Invalid ID!!' })
        }

        menu.name = req.body.name
        await menu.save()
        
        const listMenuItem = req.body.items
        for(let i = 0; i < listMenuItem.length; i++){
            if(!listMenuItem[i].id){
                var newItem = new MenuItem({
                    food_name: listMenuItem[i].food_name,
                    description: listMenuItem[i].description,
                    price: listMenuItem[i].price
                })
                await newItem.save()

                menu.item.push(newItem._id)
                await menu.save()
            }
            else{
                const checkId = await MenuItem.findById(listMenuItem[i].id)
                if(!checkId){
                    return res.status(400)
                        .json({success: false, error:`MenuItem ${listMenuItem[i].id} not exsist!!`})
                }

                const checkName = await MenuItem.findOne({food_name: listMenuItem[i].food_name})
                if(checkName){
                    return res.status(400)
                            .json({ success: false, message: `The food name ${listMenuItem[i].food_name} already exists!` })
                }

                await MenuItem.updateOne({_id: listMenuItem[i].id},
                    {"$set": {
                        food_name: listMenuItem[i].food_name,
                        description: listMenuItem[i].description,
                        price: listMenuItem[i].price
                    }})
            }
        }

        menu = await Menu.findById(req.params.id).populate("item")
        res.json({success:true, menu})
        
    } catch (error) {
        res.status(500).json(error)
    }
})

router.put("/addMenuItem/:id", verifyAdminRole, async(req,res) =>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try {
        let menu = await Menu.findById(req.params.id)
        if(!menu){
            return res.status(404).json({success: false,
                message: 'Invalid ID!!' })
        }
        var listMenuItemId = req.body.menuItemId

        for(let i = 0; i < listMenuItemId.length; i++){
            let menuItem = await MenuItem.findById(listMenuItemId[i])
            if(Object.keys(menuItem).length === 0){
                return res.status(400).json({success: false, error:`Type ${listMenuItemId[i]} not exsist!!`})
            }

            // const check = await Menu.find({'item': listMenuItemId[i]})
            // if(check.length !== 0){
            //     return res.status(404).json({success: false, message: `MenuItem ${listMenuItemId[i]} already in other Menu!!`})
            // }
        }

        await Menu.updateMany(
        {
            _id: req.params.id
        },
        {
            $push:{
                item: listMenuItemId 
            }
        }, {new: true})

        menu = await Menu.findById(req.params.id).populate("item")
        res.json({success:true, menu})
        
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.put("/removeMenuItem/:id", verifyAdminRole, async(req,res) =>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }

    try {
        let menu = await Menu.findById(req.params.id)
        if(!menu){
            return res.status(404).json({success: false,
                message: 'Invalid ID!!' })
        }
        var listMenuItemId = req.body.menuItemId

        for(let i = 0; i < listMenuItemId.length; i++){
            let check = await Menu.findOne({ 'item': listMenuItemId[i] , "_id": req.params.id})
            if(!check){
                return res.status(400).json({success: false, error:`MenuItem ${listMenuItemId[i]} not exsist in menu ${menu.name}!!`})
            }
        }

        await Menu.updateMany(
        {_id: req.params.id},
        {
            $pullAll:{item: listMenuItemId }
        }, {new: true})

        menu = await Menu.findById(req.params.id).populate("item")
        res.json({success:true,menu})
        
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.get("/get-all", async(req,res) => {

    try {
        const listMenu = await Menu.find().sort({createAt:-1})
        .populate("item")
        if(listMenu.length === 0){
            return res
                .status(404)
                .json({success: false, message: 'No menu data!' })
        }

        let results = listMenu

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

//get menu by id
router.get("/:id", async(req,res)=>{
    if(!req.params.id){
        return res.status(400).json({success: false,
            message: 'Please enter ID!!' 
       })
    }
    try {
        const menu = await Menu.findById(req.params.id)
        .populate("item")
        if (!menu) {
            return res.status(404)
                .json({success: false, message: 'Invalid ID!!' })
        }
        return res.json({ success: true, menu })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router