const isLogin = async(req,res,next)=> {

  try {

    if(req.session.user_id){
      console.log("session");
      
    }
    else{
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
  next();

}

const isLogout = async(req,res,next)=> {

  try {
    
    if(req.session.user_id){
      console.log("insession");
      res.redirect('/home')
      console.log("registrr heree");
    }
    else{
      next();

      console.log("sessionout");
    }
  } catch (error) {
    console.log(error.message);
  }

}

module.exports = {
  isLogin,
  isLogout
}