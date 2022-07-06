require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const Image = require("./models/Image");
const { imageRouter } = require("./routes/imageRouter");
const app = express();
const { MONGO_URI, PORT } = process.env;

mongoose.connect(MONGO_URI).then(()=> {
  console.log("MongoDB Connected.")
  
  // 외부에서 uploads라는 폴더에 접근할 수 있게 해준다.
  app.use("/uploads", express.static("uploads"))
  app.use("/images", imageRouter)
  app.listen(PORT, () => console.log("express server listening on PORT " + PORT))
  
}).catch(err =>{
  console.log(err)
})
