//jshint esversion:6
const express = require("express");
const path  = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// No variable assignment since User is not exported
require ("./models/User");
//Local constants
const app = express();
const PORT = 5000;

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: '+add);
});

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const User = mongoose.model("user");

// ---------------------------------------------Database Connection-----------------------------------------------------------

const mongoUri = "mongodb+srv://brenwick02:Brenwick64!@cluster0.9dtue.mongodb.net/Cluster0?retryWrites=true&w=majority";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('connected', () => {
  console.log("Connected to: MongoDB Atlas");
});
mongoose.connection.on('error', (err) => {
  console.log("Error: ", err);
});


//-----------------------------------------------Express Server---------------------------------------------------------------
app.listen(PORT, function() {
  console.log("Server started on port: " + PORT);
});

// TODO -- TRY / CATCH Blocks!!!


// GET All Users
app.get('/users', async (req, res) => {
  console.log('All Users Requested from API.');
  const filter = {};
  const all = await User.find(filter);
  res.send(all);
});

// Get User by Id
app.get('/userId:id', async (req, res) => {
  console.log('User Requested by ID: ' + req.params.id);
  const user = await User.findById(mongoose.Types.ObjectId(req.params.id))
  res.send(user);
})

// Get User by username
app.get('/userName:name', async (req, res) => {
  console.log('User Requested by username: ' + req.params.name);
  const user = await User.findOne({ username: req.params.name });
  res.send(user);
})

// CREATE NEW User profile
app.post('/user', (req, res) => {
  console.log(req.body);
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    retypePassword: req.body.retypePassword
  });
  newUser.save()
  .then(data => {
      console.log(data);
      res.json({
        "message" : "Successfully added user to database"
      })
    }).catch(err => {
      console.log(err);
      res.json({
        "error" : "server error"
      });
  });
});


// DELETE user by name 
//TODO: This is very unsecure and should only be used for debugging
app.post('/deleteuser', async (req, res) => {
  await User.findByIdAndDelete(req.body.payload._id)
  .then(
    console.log(req.body),
    console.log('Deleted User: ' + req.body.payload._id),
    res.send(await User.find({}))
  )
  .catch(err => {
    console.log(err);
  })
})


// UPDATE existing user record
app.post('/updateuser', (req, res)=> {
  User.findByIdAndUpdate(req.body.id, {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password
  })
  .then(data => {
    res.send('Updated User: ' + req.body.name)
  })
  .catch(err => {
    console.log(err);
  })
})

