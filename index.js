const express = require('express')
const bodyParser = require('body-parser')
const {signup, signin,forgotPassword, resetPassword, ensureCorrectUser,loginRequired} = require('./middleware/middleware')
const db = require('./models/db')
//const cors = require('cors')
const app = express()

app.set('view engine','ejs')

// app.use(cors())
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", ".localhost"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.get('/api/users',loginRequired, async function(req,res,next){
    await db.User.find()
    .then(function(users){
        res.json(users)
    })
    .catch(function(err){
        res.send(err)
    })
})
app.get('/',function(req,res){
    res.send("Hello World")
})
app.get('/signup',function(req,res){
    res.render('signup.ejs')
})
app.get('/signin',function(req,res){
    res.render('signin.ejs')
})
app.get('/forgotPassword',function(req,res){
    res.render('forgotPassword.ejs')
})
app.get('/resetPassword/:id/:token', async function(req,res,next){
    try{
        var user = await db.User.findOne({_id : req.params.id})
    res.send('<form action="/resetPassword/" method="POST">' +
        '<input type="hidden" name="id" value="' + user._id + '" />' +
        '<input type="hidden" name="token" value="' + req.params.token + '" />' +
        '<input type="password" name="password" value="" placeholder="Enter your new password..." />' +
        '<input type="submit" value="Reset Password" />' +
    '</form>')
    }catch(err){
        throw err
    }
})
app.get('/securedRoute', ensureCorrectUser, (req,res) =>{
    res.send("This is a secured route")
})

app.post('/signup',signup)
app.post('/signin',signin)
app.post('/forgotPassword',forgotPassword)
app.post('/resetPassword',resetPassword)

app.listen(3001,function(){
    console.log("Server running on port 3001")
})
