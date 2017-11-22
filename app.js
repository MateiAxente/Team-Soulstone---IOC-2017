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

app.get('/', function(req, res){
  //res.sendFile(__dirname + '/views/template.html')

  res.render("chat")
})

app.listen( 8098, function(){
  console.log("Started landing page");
})