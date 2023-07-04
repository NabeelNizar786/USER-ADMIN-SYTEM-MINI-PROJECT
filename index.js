// FOR CONNECTING DATABASE //
const mongoose = require('mongoose');
mongoose.connect(`mongodb://127.0.0.1:27017/UMS`);
// ------------------------------------------------- //

const express = require('express');
const app = express();
const port = process.env.PORT || 2000;



app.use((req,res,next)=>{
  res.set('cache-control','no-store')
  next()


})



// FOR USER ROUTES //
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

// FOR ADMIN ROUTES //
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);


app.listen(port,()=>{
  console.log(`SERVER STARTS at ${port}`);
});