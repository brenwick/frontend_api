const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    phone: String,
    password: String
}); 

mongoose.model("user", UserSchema);

