const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdminRole } = require('../middlewares/jwt_service')
const OpenScheduleSchema = require('../models/openningSchedule')
require('dotenv').config()

router.get('/get-all', async(req,res) => {
    try {
        const listOpen = await OpenScheduleSchema.find()

        res.json({success:true, "openningSchedule": listOpen})
    } catch (error) {
        res.status(500).json(error)
    }
    
}) 

router.put('/change', verifyAdminRole, async(req,res) => {
    try{
        const listItem = req.body.schedules
        for(let i = 0; i < listItem.length; i++){
            var editOpen = await OpenScheduleSchema.findOne(
                {
                    open_day:{$regex: listItem[i].open_day, $options:'i'} 
                }
            )
            
            editOpen.open_time = listItem[i].open_time
            editOpen.close_time = listItem[i].close_time
            await editOpen.save()
        }
        
        const listOpen = await OpenScheduleSchema.find()
        
        res.json({success:true, "openningSchedule": listOpen})
    
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router