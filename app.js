var enviroment = require('dotenv').config()
var express = require('express')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var app = express()
var path = require("path")
var crypto = require('crypto')
var file = require('fs')
var jsonexport = require('jsonexport')
var path = require('path')

var nodemailer = require('nodemailer')

var bodyParser = require('body-parser')
var url = require('url')

var mysql = require('mysql')
var oauth = require('oauth')
//var env = require('./env')

var knex = require('knex')({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
})

console.log("Env vars ")
console.log(enviroment)

//mysql connect
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user:     process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
});
//mysql connect end

process.on('exit', function(){
    pool.end( function(err){
    })
})

//app.set('view engine', 'html')
app.set('view engine', 'pug')

app.use( express.static('public') )

app.use( cookieParser() )

//app.use( session( {secret: env.session.secret, resave: false, saveUninitialized:false} ) )

app.use( bodyParser.urlencoded( { extended: true } ) )
app.use( bodyParser.json() )
app.use( session( {secret: process.env.SESSION_SECRET, resave: false, saveUninitialized:false} ) )

app.get('/updateProfile', function(req, res) {
  if(req.session.username)
    res.render('update_profile', {username: req.session.username})
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
})

app.get('/uploadDocument', function(req, res) {
  if(req.session.username)
    res.render('upload_document', {username: req.session.username})
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
})

app.get('/document', function(req, res) {
  if(req.session.username)
    res.render('document_page')
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
})

app.get('/chat', function(req, res) {
  if(req.session.username)
    res.render('chat')
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
})

app.post('/register', function(req, res) {
  var email = req.body.email
  var password = req.body.pass
  var username = req.body.username
  knex.select('username', 'email', 'name', 'pass', 'profile_picture', 'description', 'group', 'spec', 'faculty').from('users').where('username', username).then(function(user) {
    if(user.length >= 1) {
      console.log("User exists")
      req.session.error = "The username is already taken! Please select another username."
      req.session.validation = 0
    } else {
      if (req.body.pass != req.body.new_pass) {
        req.session.validation = 0
        req.session.error = "Passwords do not match! Please reenter the informations."
      } else {
        req.session.validation = 1
        var to_insert = {email:req.body.email, 
          pass:req.body.pass,
          username:req.body.username,
          name: req.body.name,
          profile_picture: req.body.profile_picture,
          description: req.body.description,
          group: req.body.group,
          spec: req.body.spec,
          faculty: req.body.faculty
        }
        pool.query( 'INSERT INTO `users` SET ?', to_insert ,function(error, results, fields){
          console.log('inserted email')
        })

        req.session.username = req.body.username
        req.session.email = req.body.email
        req.session.profile_picture = req.body.profile_picture
        req.session.name = req.body.name
        req.session.description = req.body.description
        req.session.group = req.body.group
        req.session.spec = req.body.spec
        req.session.faculty = req.body.faculty
      }
    }
    if(req.session.validation == 0) {
      res.redirect('/')
    } else {
      res.redirect('/mainPage')
    }
  })
})

app.post('/login', function(req, res) {
  var password = req.body.pass
  var username = req.body.username
  knex.select('username', 'email', 'name', 'pass', 'profile_picture', 'description', 'group', 'spec', 'faculty').from('users').where({'username': username, 'pass': password}).then(function(user) {
    if(user.length >= 1) {
      console.log("Found user")
      req.session.validation = 1

      req.session.username = req.body.username
      req.session.email = req.body.email
      req.session.profile_picture = req.body.profile_picture
      req.session.name = req.body.name
      req.session.description = req.body.description
      req.session.group = req.body.group
      req.session.spec = req.body.spec
      req.session.faculty = req.body.faculty
    } else {
      req.session.validation = 2
      req.session.error = "No user with this credentials! Please reenter login informations."
    }
    if(req.session.validation == 2) {
      res.redirect('/')
    } else {
      res.redirect('/mainPage')
    }
  })
})

app.post('/update-profile', function(req, res) {
  console.log("Tst")
  var info = {}
  if(req.body.name) {
    info.name = req.body.name
  }
  if(req.body.profile_picture) {
    info.profile_picture = req.body.profile_picture
  }
  if(req.body.email) {
    info.email = req.body.email
  }
  if(req.body.faculty) {
    info.faculty = req.body.faculty
  }
  if(req.body.spec) {
    info.spec = req.body.spec
  }
  if(req.body.group) {
    info.group = req.body.group
  }
  knex.select('*').from('users').where({'username': req.session.username}).then(function(user){
    if(user.length == 0 ) {
      console.log("User not found")
      req.session.validation = 3
      req.session.error = "No user with that username!"
      res.redirect('/')
    } else {
      knex("users").where({"username": req.session.username}).update(info).then(function(user){
        console.log("Updated document")
        res.redirect('/mainPage')
      })
    }
  })

app.post('/logout', function(req, res) {
  req.session.destroy()
  res.redirect("/")
})

app.get('/mainPage', function(req, res) {
  if(req.session.username)
    res.render('main_page', {username: req.session.username})
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
})

app.get('/', function(req, res){
  //res.sendFile(__dirname + '/views/template.html')

  res.render("login_page", {error: req.session.error, validation: req.session.validation})
})

app.listen( 8098, function(){
  console.log("Started landing page");
})
