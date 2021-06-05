const db = require('../models/db')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const secret = 'secret'
const email = "email@email.com"
const password = "password"

exports.signup = async function(req,res,next){
    try{
        var existingUsername = await db.User.findOne({username: req.body.username})
        var existingEmail = await db.User.findOne({email: req.body.email})
        if(existingUsername || existingEmail){
            return res.status(401).json({
                message: "User already exists"
            })
        }else{    
        var user = await db.User.create(req.body)
        var {email, username, password} = user
        let token = jwt.sign({
            email,
            username,
            password
        },secret)
        return res.status(200).json({
            email,
            username,
            password,
            token
        })}
    }catch (err) {
        if (err.code === 11000) {
        err.message = "Sorry, that username and/or email is taken"
        }
        return next({
        status: 400,
        message: err.message
        });
    }
}

exports.signin = async function(req, res, next) {
    try{
    let user = await db.User.findOne({email: req.body.email})
    let isMatch = await user.comparePassword(req.body.password)
    let {id, username, profileImageUrl} = user;
    if(isMatch){
        let token = jwt.sign({
        id,
        username,
        profileImageUrl
        },'secret')
        return res.status(200).json({
        id,
        username,
        profileImageUrl,
        token
        })
    }else{
        return res.status(400).json({
            status: 400,
            message: "Error occured"
        })
    }
    }
    catch(err){
    return res.status(400).json({
        status: 400,
        message: "Error occured try again"
    })
    }
}

exports.forgotPassword = async function(req,res,next){
    var user = await db.User.findOne({email: req.body.email})
    var id = await user._id
    var secret = (await user).password.split('/')[1]
    var url = 'http://localhost:3001/resetPassword/' + id + '/' + secret
    try{
        if(!user){
            return res.status(400).json({error:"User not found"})
        }else{
            let mailTransporter = nodemailer.createTransport({ 
                service: 'gmail', 
                auth: { 
                    user: email, 
                    pass: password
                } 
            })
            let mailDetails = { 
                from: email, 
                to: req.body.email, 
                subject: 'You requested for password reset and click on the url for password reset', 
                text: url
            }
            mailTransporter.sendMail(mailDetails, function(err, data) { 
                if(err) { 
                    console.log('Error Occurs')
                } else { 
                    console.log('Email sent successfully')
                } 
            })
            res.json({message: "Email sent successfully"})
        }
    }catch(err){
        return res.status(400).json({error:"User not found"})
    }
}

exports.resetPassword = async function(req,res){
    try{
    console.log(req.body.id)
    var hashedPassword = await bcrypt.hash(req.body.password,10)
    await db.User.findOneAndUpdate({_id: req.body.id},{password: hashedPassword})
    var user = await db.User.findById({_id : req.body.id})
    console.log(user.password)
    res.status(200).json(user)
    res.redirect('/')
    }catch(err){
        throw err
    }
}

exports.loginRequired = function(req,res,next){
    console.log(req.headers)
    try{
        let token = req.headers['authorization']
        jwt.verify(token, secret, function(err,decoded){
            console.log(decoded)
            if(decoded){
                return next()
            }
        })
    }catch(err){
        throw err
    }
}   

exports.ensureCorrectUser =async function(req,res,next){
    try{
        let token =await req.headers.authorization
        jwt.verify(token, secret, function(err, decoded){
        if(decoded && decoded.id === req.params.id){
            return next()
        }else{
            return next({
                status: 401,
                message: "Unauthorized"
            })
        }
    })
    }catch(err){
        return next({
            status: 401,
            message: "Unauthorized"
        })
    } 
}