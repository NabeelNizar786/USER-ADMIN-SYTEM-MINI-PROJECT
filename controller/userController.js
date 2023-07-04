const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const config = require('../config/config');

// TO ENCRYPT PASSWORD //

const securePassword = async(password)=> {

  try {
    
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;

  } catch (error) {
    console.log(error.message);
  }

};

// FOR SENDING MAIL //

const sendVerifyMail = async(name, email, user_id)=> {

  try {

    const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:config.emailUser,
        pass:config.emailPassword
      }
    });
    const mailOptions = {
      from:'nabeelnizar786@gmail.com',
      to:email,
      subject:'For Verification mail',
      html:'<p>Hi '+name+', please click here to <a href="http://127.0.0.1:2000/verify?id='+user_id+'"> Verify </a> your email.</p>'
    }
    transporter.sendMail(mailOptions, function(error,info){
      if(error){
        console.log(error);
      }
      else{
        console.log("Email has been sent:-",info.response);
      }
    });
    
  } catch (error) {
    console.log(error.message);
  }
  
}

// FOR SENDING RESET PASSWORD MAIL LINK //

const sendResetPasswordMail = async(name, email, token)=> {

  try {

    const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:"",
        pass:''
      }
    });
    const mailOptions = {
      from:"",
      to:email,
      subject:'For Reset Password',
      html:'<p>Hi '+name+', please click here to <a href="http://127.0.0.1:2000/forget-password?id='+token+'"> Reset </a> your password.</p>'
    }
    transporter.sendMail(mailOptions, function(error,info){
      if(error){
        console.log(error);
      }
      else{
        console.log("Email has been sent:-",info.response);
      }
    });
    
  } catch (error) {
    console.log(error.message);
  }
  
}

// TO ENTER REGISTRATION PAGE //

const loadRegister = async(req,res)=> {
  try {

    res.render('register')

  } catch (error) {
    console.log(error.message);
  }
};

// TO REGISTER USER DATA //

const insertUser = async(req,res)=> {
  try {

    const checkEmail = await User.findOne({email:req.body.email})
    if(!checkEmail){

    const spassword = await securePassword(req.body.password)
    const user = new User({
      name:req.body.name,
      email:req.body.email,
      image:req.file.filename,
      password:spassword,
      isAdmin:0
    });

    const userData = await user.save();

    if(userData) {
      sendVerifyMail(req.body.name, req.body.email, userData._id);
      res.render('register',{message:"Registration is Successfull! Please verify"});
    }
    else{
      res.render('register',{message:"Registration is Failed!"});
    }
  }
  else{
    res.render('register',{message:"Email ID already Exist, Please use different Email"})
  }

  } catch (error) {
    console.log(error.message);
  }
};

// FOR EMAIL VERIFICATION //

const verifyEmail = async(req,res)=> {

  try {

    const updateInfo = await User.updateOne({_id:req.query.id},{$set:{ isVerified:1 }});

    console.log(updateInfo);
    res.render('email-verified');

  } catch (error) {
    console.log(error.message);
  }

};

// FOR USER LOGIN //

const loginLoad = async(req,res)=> {

  try {

    res.render('login');
    
  } catch (error) {
    console.log(error.message);
  }

}

// FOR USER VERIFICATION //

const verifyLogin = async(req,res)=> {

  try {

    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({email:email});
    console.log(userData,"sessionon");
    if(userData) {

      const passwordMatch = await bcrypt.compare(password, userData.password);

      if(passwordMatch) {

        if(userData.isVerified === 0) {
          res.render('login',{message:"Please Verify Your Email!"});
        }
        else{
          req.session.user_id = userData._id;
          console.log(userData.user_id,"session");
          res.redirect('/home');
        }

      }
      else{
        res.render('login',{message:"Email and Password is incorrect!"});
      }
    }
    else{
      res.render('login',{message:"Email and Password is incorrect!"})
    }
    
  } catch (error) {
    console.log(error.message);
  }

}

const loadHome = async(req,res)=> {

  try {
    
    const userData = await User.findById({ _id:req.session.user_id });
    res.render('home',{ user:userData, req });

  } catch (error) {
    console.log(error.message);
  }

}

// FOR USER LOGOUT //

const userLogout = async(req,res)=> {

  try {
    
    req.session.user_id= "";
    res.redirect('/');

  } catch (error) {
    console.log(error.message);
  }

}

// FOR FORGET PASSWORD //

const forgetLoad = async(req,res)=> {

  try {
    
    res.render('forget')

  } catch (error) {
    console.log(error.message);
  }

}

const forgetVerify = async(req,res)=> {

  try {
    
    const email = req.body.email;
    const userData = await User.findOne({email:email});
    if(userData){

      if (userData.isVerified === 0) {
        res.render('forget',{message:"Please Verify Your Email!"});
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne({email:email},{$set:{ token:randomString }});
        sendResetPasswordMail(userData.name,userData.email,randomString);
        res.render('forget',{message:"Please check your mail to reset your password"});
      }

    }
    else{
      res.render('forget',{message:"Email id is incorrect"});

    }
  } catch (error) {
    console.log(error.message);
  }

}

const forgetPasswordLoad = async(req,res)=> {

  try {
    
    const token = req.query.token;
    const tokenData = await User.findOne({token:token});
    if(tokenData){

      res.render('forget-password',{user_id:tokenData._id});

    }
    else{
      res.render('404',{message:"Token is Invalid!"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const resetPassword = async(req,res)=> {

  try {
    
    const password = req.body.password;
    const user_id = req.body.user_id

    const secure_password = await securePassword(password);

    const updatedData = await User.findByIdAndUpdate({_id:user_id},{ $set:{ password:secure_password, token:''} });

    res.redirect('/');

  } catch (error) {
    console.log(error.message);
  }

}

// FOR EDITING USER DATA //

const editLoad = async(req,res)=> {

  try {
    
    const id = req.query.id;

    const userData = await User.findById({ _id:id });

    if(userData){
      res.render('edit',{ user:userData, req });
    }
    else{
      res.redirect('/home')
    }

  } catch (error) {
    console.log(error.message);
  }

}

// const updateProfile = async(req,res)=> {

//   try {
    
//     const nameCheck = req.body.name.trim();
//     if (nameCheck === '' ) {
//        res.redirect('/home?error=Invalid name format. Only alphabets and spaces are allowed.');
//     }
//     else{

//       if (req.file) {
//         const userData = await User.findByIdAndUpdate({ _id:req.body.id },{ $set:{name:req.body.name, email:req.body.email, image:req.file.filename} });
//       } else {
//         const userData = await User.findByIdAndUpdate({ _id:req.body.id },{ $set:{name:req.body.name, email:req.body.email} });
//       }
  
//       res.redirect('/home');
      
//     }

//   } catch (error) {
//     console.log(error.message);
//   }

// }

const updateProfile = async(req, res)=> {
  try {
    const emailCheck = req.body.email.trim();
    const nameCheck = req.body.name.trim();
    if (!nameCheck || !emailCheck) {
      res.redirect('/home?error=Invalid name or email format. Only alphabets and spaces are allowed.');
    } else {
      const email = req.body.email;
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id != req.body.id) {
        res.redirect('/home?error=Email ID already exists!');
      } else {
        let update = { name: req.body.name, email: req.body.email };
        if (req.file) {
          update.image = req.file.filename;
        }
        const userData = await User.findByIdAndUpdate({_id:req.body.id}, { $set: update });
        res.redirect('/home');
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  verifyEmail,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  editLoad,
  updateProfile
};