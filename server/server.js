const express = require('express');

// 이미지를 업로드할 때 주로 사용하는 패키지 multer
const multer = require('multer');

const { v4: uuid } = require('uuid');
const mime = require('mime-types');
const mongoose = require('mongoose');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  // uuid()로 파일명을 고유 id로 저장하고, file.mimetype을 이용해 전송한 파일타입과 동일하게 저장한다.
  filename: (req, file, cb) => cb(null, `${uuid()}.${mime.extension(file.mimetype)}`)
})
// uplaods라는 폴더에 이미지를 저장하겠다.
// req에 있는 image를 뽑아와서 upload에 저장해준다.
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if(["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) cb(null,true)
    else{
      cb(new Error("Invalid file type."), false)
    };
  },
  limits: {
    fileSize: 1024 * 1024 * 5
  }
})

const app = express();
const PORT = 5000;

  // admin
  // ayiZRwaAwyhsRg0U

mongoose.connect(
  "mongodb+srv://admin:ayiZRwaAwyhsRg0U@cluster0.bpiyn.mongodb.net/?retryWrites=true&w=majority"
).then(()=> {
  console.log("MongoDB Connected.")
  
  // 외부에서 uploads라는 폴더에 접근할 수 있게 해준다.
  app.use("/uploads", express.static("uploads"))

  // image라는 key로 저장된 값(파일)을 불러온다.
  app.post("/upload", upload.single("image"), (req, res) => {
    console.log(req.file);
    res.json(req.file);
  });

  app.listen(PORT, () => console.log("express server listening on PORT " + PORT))
  
}).catch(err =>{
  console.log(err)
})
