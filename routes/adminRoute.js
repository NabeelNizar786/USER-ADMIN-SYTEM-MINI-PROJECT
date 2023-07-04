const express = require('express');
const admin_route = express();
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,path.join(__dirname,'../public/userimages'));
  },
  filename:(req,file,cb)=> {
    const name = Date.now()+'-'+file.originalname;
    cb(null,name);
  }
});

const upload = multer({storage:storage});
const adminController = require('../controller/adminController');
const auth = require('../middleware/adminAuth');


admin_route.set('view engine', 'ejs');
admin_route.set('views','./views/admin');

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended:true }));
admin_route.use(session({
  secret:"secretKey",
  saveUninitialized: true,
  resave: false
}));

admin_route.get('/',auth.isLogout,adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home',auth.isLogin,adminController.loadDashboard);

admin_route.get('/logout',auth.isLogin,adminController.logout);

admin_route.get('/dashboard',auth.isLogin,adminController.adminDashboard);

admin_route.get('/new-user',auth.isLogin,adminController.newUserLoad);

admin_route.post('/new-user',upload.single('image'),adminController.addNewUser);

admin_route.get('/edit-user',auth.isLogin,adminController.editUserLoad);

admin_route.post('/edit-user',adminController.updateUserData);

admin_route.get('/delete-user',adminController.deleteUserData);

admin_route.get('*',function(req,res){
  res.redirect('/admin')
})

module.exports = admin_route;