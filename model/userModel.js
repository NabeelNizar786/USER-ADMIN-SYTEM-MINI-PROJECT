const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  image:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  isAdmin:{
    type:Number,
    required:true
  },
  isVerified:{
    type:Number,
    default:0
  },
  token:{
    type:String,
    default:''
  }
});

module.exports = mongoose.model('User',userSchema);

