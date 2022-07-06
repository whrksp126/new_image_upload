const { Router } = require('express');
const { upload } = require('../middleware/imageUpload');
const imageRouter = Router();
const Image = require("../models/Image");
// image라는 key로 저장된 값(파일)을 불러온다.
imageRouter.post("/images", upload.single("image"), async (req, res) => {
  console.log(req.file);
  const image = await new Image({
    key: req.file.filename, 
    originalFileName: req.file.originalname
  }).save();
  res.json(image);
});

imageRouter.get("/images", async (req, res)=>{
  const images = await Image.find();
  res.json(images);
})

module.exports = { imageRouter };