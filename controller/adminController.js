const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');

 const securePassword=async(password)=>{
   try {
       const passwordHash = await bcrypt.hash(password,10)
       return passwordHash

      
   } catch (error) {
       console.log(error.message)
      
   }

 }

const loadLogin = async(req,res)=> {

  try {
      
    res.render('login')  

  } catch (error) {
    console.log(error.message);  
  }

}

const verifyLogin = async(req,res)=> {

  try {
      
    const email = req.body.email
    const password = req.body.password
    
    const userData = await User.findOne({email:email})
    if(userData){

      const passwordMatch = await bcrypt.compare(password, userData.password)

      if(passwordMatch){

          if(userData.is_admin === 0){

              res.render('login',{message: "Email and Password is incorrect!"});

          }
          else{
              req.session.admin_id = userData._id
              res.redirect('/admin/home')
          }

      }
      else{

          res.render('login',{message:" password is incorrect"})

      }

    }
    else{

      res.render('login',{message:"Email or password is incorrect"})

    }

  } catch (error) {
    console.log(error.message);  
  }

}

const loadDashboard  =async(req,res)=> {

  try {
      
      const userData = await User.findOne({_id:req.session.admin_id})
      res.render('home',{admin:userData})

  } catch (error) {
    console.log(error.message);  
  }

}

const logout = async(req,res)=> {

  try {
      req.session.admin_id = "";
      res.redirect('/admin')

  } catch (error) {
    console.log(error.message);  
  }

}

const adminDashboard = async(req,res)=> {

  try {

    var search = ''
    if(req.query.search){
      search=req.query.search
    }

    const userData = await User.find({isAdmin:0,
    $or:[
      {name:{$regex:'.*'+search+'.*',$options:'i'}},
      {email:{$regex:'.*'+search+'.*',$options:'i'}},
    ]});
    
    res.render('dashboard',{users:userData, req})

  } catch (error) {
    console.log(error.message);
  }

}

const newUserLoad = async(req,res)=> {

  try {
    
    res.render('new-user')

  } catch (error) {
    console.log(error.message);
  }

}

// const addNewUser = async(req,res)=> {

//   try {
    
//     const name = req.body.name;
//     const email = req.body.email;
//     const image = req.file.filename;
//     const password = randomstring.generate(8);

//     const spassword = await securePassword(password);

//     const emailCheck = await User.findOne({email:req.body.email});
//     if(!emailCheck){


//     const user = new User ({
//       name:name,
//       email:email,
//       image:image,
//       password:spassword,
//       isAdmin:0
//     })

//     const userData= await user.save();

//     if(userData){

//       res.redirect('/admin/dashboard');

//     }
//     else{

//       res.render('new-user',{message:'Something Wrong!!'});

//     }

//   }
//   else{

//     res.render('new-user',{message:'User Already Exist!!'});

//   }

//   } catch (error) {
//     console.log(error.message);
//   }

// }

const addNewUser = async(req,res)=> {
  try {
    const name = req.body.name.trim(); // Trim leading and trailing spaces
    const email = req.body.email.trim();
    const image = req.file && req.file.filename;
    const password = randomstring.generate(8);

    const spassword = await securePassword(password);

    // Check if any field is empty after trimming spaces
    if (!name || !email || !image) {
      return res.render('new-user', { message: 'Please fill all fields correctly!' });
    }

    const emailCheck = await User.findOne({ email: email });
    if (!emailCheck) {
      const user = new User({
        name: name,
        email: email,
        image: image,
        password: spassword,
        isAdmin: 0
      });

      const userData = await user.save();

      if (userData) {
        res.redirect('/admin/dashboard');
      } else {
        res.render('new-user', { message: 'Something Wrong!!' });
      }
    } else {
      res.render('new-user', { message: 'User Already Exist!!' });
    }
  } catch (error) {
    console.log(error.message);
  }
}


const editUserLoad = async(req,res)=> {

  try {
    
    const id = req.query.id;
    const userData = await User.findById({_id:id});

    if(userData){
      res.render('edit-user',{user:userData});
    }
    else{
      res.redirect('/admin/dashboard')
    }

  } catch (error) {
    console.log(error.message);
  }

}

// const updateUserData = async(req,res)=> {

// try {

//   const nameCheck = req.body.name.trim();
//   if (nameCheck === '' ) {
//      res.redirect('/admin/dashboard?error=Invalid name format. Only alphabets and spaces are allowed.');
//   } else{

//     const userData = await User.findByIdAndUpdate({_id:req.body.id},{ $set:{ name:req.body.name, email:req.body.email} });
//     res.redirect('/admin/dashboard')
    
//   }


// } catch (error) {
//   console.log(error.message);
// }

// }

const updateUserData = async (req, res) => {
  try {
    const emailCheck = req.body.email.trim();
    const nameCheck = req.body.name.trim();
    if (!nameCheck || !emailCheck ) {
      res.render('new-user',{message:"Email exist"});
    } else {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser && existingUser._id != req.body.id) {
        res.render('edit-user',{message:"Email exist", user:existingUser});
      } else {
        const userData = await User.findByIdAndUpdate(
          { _id: req.body.id },
          { $set: { name: req.body.name, email: req.body.email } }
        );
        res.redirect('/admin/dashboard');
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteUserData = async(req,res)=> {

  try {
    
    const id = req.query.id
    console.log(id);
    await User.deleteOne({_id:id})
    res.redirect('/admin/dashboard')

  } catch (error) {
    console.log(error.message);
  }

}

module.exports = {

  securePassword,
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  adminDashboard,
  newUserLoad,
  addNewUser,
  editUserLoad,
  updateUserData,
  deleteUserData

}