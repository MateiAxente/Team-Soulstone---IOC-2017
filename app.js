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
var multer = require('multer')
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

//app.use( express.static('public') )
app.use('/public', express.static('public'));

app.use( cookieParser() )

//app.use( session( {secret: env.session.secret, resave: false, saveUninitialized:false} ) )

app.use( bodyParser.urlencoded( { extended: true } ) )
app.use( bodyParser.json() )
app.use( session( {secret: process.env.SESSION_SECRET, resave: false, saveUninitialized:false} ) )

app.get('/updateProfile', function(req, res) {
  if(req.session.username)
    res.render('update_profile', {username: req.session.username, profile_picture: req.session.profile_picture})
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
})

app.get('/uploadDocument', function(req, res) {
  if(req.session.username)
    res.render('upload_document', {username: req.session.username, profile_picture: req.session.profile_picture})
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
})

const upload = multer({
  dest: 'uploads/'
}); 

app.post('/upload-document', upload.single('document'), (req, res) => {
  knex.select('id').from('users').where('username', req.session.username).then(function(user) {
    var path = req.file.filename
    var to_insert = {
      title:req.body.title,
      size:req.body.size,
      description:req.body.description,
      rating:0,
      path:path,
      comments:'',
      type:req.body.type,
      uid: user[0].id
    }
    console.log(to_insert)
    pool.query( 'INSERT INTO `documents` SET ?', to_insert ,function(error, results, fields){
      console.log('inserted email')
    })
    res.redirect('/mainPage');
  })
});

app.get('/download/:path/:name', function (req, res, next) {
    var fileName = req.params.name
    var filePath = "uploads/" + req.params.path

    res.download(filePath, fileName);    
});

app.post('/search-document', (req, res) => {
  if(req.session.username) {
    knex.select('id').from('users').where('username', req.session.username).then(function (user) {
      var uid = user[0].id
      console.log('User id is: ' + uid)

      knex.select('*').from('documents').where('title', req.body.search).orderBy('id', 'desc').then(function (docs) {
        var all_docs = docs
        console.log('DOCS')
        console.log(all_docs)

        knex.select('*').from('documents').orderBy('id', 'desc').limit(10).where('uid', uid).then(function (user_docs) {
          var my_docs = user_docs
          console.log('USER DOCS')
          console.log(my_docs)

          res.render('main_page', {username: req.session.username, profile_picture: req.session.profile_picture, all_documents: all_docs, user_documents: user_docs})
        })
      })
    })
  }
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
});

app.get('/document/:id', function(req, res) {
  var doc_id = req.params.id
  if(req.session.username){
    knex.select('*').from('documents').where('id', doc_id).then(function(doc) {
      console.log(doc)
      res.render('document_page', {username: req.session.username, profile_picture: req.session.profile_picture, doc: doc[0]})
    })
  }
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
});

app.get('/chat', function(req, res) {
  if(req.session.username)
    res.render('chat', {username: req.session.username, profile_picture: req.session.profile_picture})
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }

// Random stuff
})

app.get('/allDocuments', function(req, res) {
  knex.select('id').from('users').where('username', req.session.username).then(function (user) {
    var uid = user[0].id
    console.log('User id is: ' + uid)

    knex.select('*').from('documents').orderBy('id', 'desc').where('uid', uid).then(function (user_docs) {
      var my_docs = user_docs
      console.log('USER DOCS')
      console.log(my_docs)
  
      res.render('all_documents', {username: req.session.username, profile_picture: req.session.profile_picture, user_documents: user_docs})
    })
  })
})

app.get('/allDocuments/:uid', function(req, res) {
  knex.select('id').from('users').where('username', req.session.username).then(function (user) {
    var uid = user[0].id
    console.log('User id is: ' + uid)

    knex.select('*').from('documents').orderBy('id', 'desc').where('uid', req.params.uid).then(function (user_docs) {
      var my_docs = user_docs
      console.log('USER DOCS')
      console.log(my_docs)
  
      res.render('all_documents', {username: req.session.username, profile_picture: req.session.profile_picture, user_documents: user_docs})
    })
  })
})

//Random stuff end

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

// app.post('/rate', function(req, res) {
//   res.redirect('/document/' + req.body.id)
// })


app.post('/login', function(req, res) {
  var password = req.body.pass
  var username = req.body.username
  knex.select('username', 'email', 'name', 'pass', 'profile_picture', 'description', 'group', 'spec', 'faculty').from('users').where({'username': username, 'pass': password}).then(function(user) {
    if(user.length >= 1) {
      console.log("Found user")
      req.session.validation = 1
      req.session.username = user[0].username
      req.session.email = user[0].email
      req.session.profile_picture = user[0].profile_picture
      req.session.name = user[0].name
      req.session.description = user[0].description
      req.session.group = user[0].group
      req.session.spec = user[0].spec
      req.session.faculty = user[0].faculty
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
    req.session.name = req.body.name
  }
  if(req.body.profile_picture) {
    info.profile_picture = req.body.profile_picture
    req.session.profile_picture = req.body.profile_picture
  }
  if(req.body.email) {
    info.email = req.body.email
    req.session.email = req.body.email
  }
  if(req.body.faculty) {
    info.faculty = req.body.faculty
    req.session.faculty = req.body.faculty
  }
  if(req.body.spec) {
    info.spec = req.body.spec
    req.session.spec = req.body.spec
  }
  if(req.body.group) {
    info.group = req.body.group
    req.session.group = req.body.group
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
})

app.get('/go-main-page', function(req, res) {
  res.redirect("/mainPage")
})

app.get('/go-courses', function(req, res) {
  res.redirect("/mainPage/curs")
})

app.get('/go-labs-sems', function(req, res) {
  res.redirect("/mainPage/labs-sems")
})

app.get('/go-exams', function(req, res) {
  res.redirect("/mainPage/subiect")
})

// redirect allDocuments -> document
app.get('/doc-view-info', function(req, res) {
  res.redirect("/document")
})

app.get('/doc-view-info/:id', function(req, res) {
  res.redirect("/document/" + req.params.id)
})

// redirect template -> edit profile
app.get('/go-edit-profile', function(req, res) {
  res.redirect("/updateProfile")
})

// redirect template -> upload documents
app.get('/go-upload-documents', function(req, res) {
  res.redirect("/uploadDocument")
})

// redirect template -> all documents
app.get('/go-all-documents', function(req, res) {
  res.redirect("/allDocuments")
})

app.get('/go-all-documents/:uid', function(req, res) {
  res.redirect("/allDocuments/" + req.params.uid)
})

// redirect template -> chat
app.get('/go-chat', function(req, res) {
  res.redirect("/chat")
})

app.post('/logout', function(req, res) {
  req.session.destroy()
  res.redirect("/")
})

app.get('/mainPage', function(req, res) {
  if(req.session.username) {
    knex.select('id').from('users').where('username', req.session.username).then(function (user) {
      var uid = user[0].id
      console.log('User id is: ' + uid)

      knex.select('*').from('documents').orderBy('id', 'desc').then(function (docs) {
        var all_docs = docs
        console.log('DOCS')
        console.log(all_docs)

        knex.select('*').from('documents').orderBy('id', 'desc').limit(10).where('uid', uid).then(function (user_docs) {
          var my_docs = user_docs
          console.log('USER DOCS')
          console.log(my_docs)

          res.render('main_page', {username: req.session.username, profile_picture: req.session.profile_picture, all_documents: all_docs, user_documents: user_docs})
        })
      })
    })
  }
  else {
    req.session.validation = 3
    req.session.error = "You must login to access this feature."
    res.redirect("/")
  }
})

app.get('/mainPage/:type', function(req, res) {
  console.log('here ')
  console.log(req.params.type)

  if(req.session.username) {
    knex.select('id').from('users').where('username', req.session.username).then(function (user) {
      var uid = user[0].id
      console.log('User id is: ' + uid)
      
      if(req.params.type == 'labs-sems')
        knex.select('*').from('documents').orderBy('id', 'desc').where('type', 'laborator').orWhere('type', 'seminar').then(function (docs) {
          var all_docs = docs
          console.log('DOCS')
          console.log(all_docs)

          knex.select('*').from('documents').orderBy('id', 'desc').limit(10).where('uid', uid).then(function (user_docs) {
            var my_docs = user_docs
            console.log('USER DOCS')
            console.log(my_docs)

            res.render('main_page', {username: req.session.username, profile_picture: req.session.profile_picture, all_documents: all_docs, user_documents: user_docs})
          })
        })
      else
        knex.select('*').from('documents').orderBy('id', 'desc').where('type', req.params.type).then(function (docs) {
          var all_docs = docs
          console.log('DOCS')
          console.log(all_docs)

          knex.select('*').from('documents').orderBy('id', 'desc').limit(10).where('uid', uid).then(function (user_docs) {
            var my_docs = user_docs
            console.log('USER DOCS')
            console.log(my_docs)

            res.render('main_page', {username: req.session.username, profile_picture: req.session.profile_picture, all_documents: all_docs, user_documents: user_docs})
          })
        })
    })
  }
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
