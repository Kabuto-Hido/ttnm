const jwt = require('jsonwebtoken')
const Account = require('../models/account')
require('dotenv').config

const verifyToken = async(req,res,next) =>{
    try {
        const authHeader = req.headers['authorization']
        if(!authHeader){
            return res
            .status(400)
            .json({success:false, message:'You are not authenticated!'})
        }
        const accessToken = authHeader.split(' ')[1]
        //const token = bearerToken[1]
    
        jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY, (err,data) => {
            if (err) {
                return res.status(403).send({ message: "Token is not valid!!" })
            }
            req.account = data
            next()
        })
  
    } catch (error) {
        return next(error)
    }
}

const verifyAdminRole = (req,res,next) =>{
    verifyToken(req,res, ()=>{
        if(req.account.accountRole === 'Admin'){
            next()
        }else{
            return res
            .status(400)
            .json({message:'No permission!'})
        }
    }) 
}

module.exports = {verifyToken, verifyAdminRole}