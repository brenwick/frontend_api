//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
// No variable assignment since User is not exported
require ("./models/User");
//Local constants
const app = express();
const PORT = 5000;


//Body Parser Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
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
app.listen(process.env.PORT || PORT, function() {
  console.log("Server started on port: " + PORT);
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

// GET All Users
app.get('/get_all_users', async (req, res) => {
  console.log('All Users Requested from API.');
  const filter = {};
  const all = await User.find(filter);
  res.send(all);
});

// Get User by Id
app.get('/get_user_by_id', async (req, res) => {
  if(req.body.id) {
    try{
      const user = await User.findById(mongoose.Types.ObjectId(req.body.id));
      res.send(user);
    }
    catch(error){
      res.send('Error: User not found.')
    }
  }
  else {
    res.send('Error: please send the MongoDB user ID in JSON format.')
  }
})


// CREATE NEW User profile
app.post('/create_user', (req, res) => {
  console.log('\nAttempting to Add User.');
  console.log(req.body);
  // JSON Information Check
  if(req.body.username && req.body.email && req.body.phone && req.body.password && req.body.retypePassword) {
    //Password match check
    if(req.body.password === req.body.retypePassword) {
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        retypePassword: req.body.retypePassword
      });
      newUser.save()
      .then(data => {
        const token = jwt.sign({ userId: newUser._id }, 'MY_SECRET_KEY');
        res.send({ token })
      }).catch(err => {
        console.log(err);
        res.status(422).send({error: 'Server Error'});
    });
    }
    else{
      res.status(422).send({error: 'Passwords do not match'});
    }
  }
  else {
    res.status(422).send({error: 'Error: please include username, email, phone, password, and retype-password in JSON format'});
  }
});


// DELETE user by name 
//TODO: This is very unsecure and should only be used for debugging
// app.post('/deleteuser', async (req, res) => {
//   await User.findByIdAndDelete(req.body.payload._id)
//   .then(
//     console.log(req.body),
//     console.log('Deleted User: ' + req.body.payload._id),
//     res.send(await User.find({}))
//   )
//   .catch(err => {
//     console.log(err);
//   })
// })


// UPDATE existing user record
// app.post('/updateuser', (req, res)=> {
//   User.findByIdAndUpdate(req.body.userId, {
//     username: req.body.username,
//     email: req.body.email,
//     phone: req.body.phone,
//     password: req.body.password
//   })
//   .then(res.send({"message" : "Updated user: " + req.body.username}))
//   .catch(err => {
//     console.log(err);
//   })
// });



// Obtain JSON Web Token
app.post('/login', async (req, res) => {

  if(req.body.password && req.body.email) {
    password = req.body.password;
    email = req.body.email;
    try{
      const user = await User.findOne({ email: email });
      if(password === user.password) {
        const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
        res.send({ token })
      }
      else {
        res.status(422).send({error: 'Error: username or password did not match'});
      }
    }
    catch(error){
      res.status(422).send({error: 'Error: username or password did not match'});
      console.log(error);
    } 
  }
  else {
    res.status(422).send({error: 'Please Enter Password and Email'});
  }
});

