const { Router } = require('express');
const { upload } = require('../middleware/imageUpload');
const imageRouter = Router();
const Image = require("../models/Image");
const fs = require("fs");
const {promisify} = require("util");
const mongoose = require('mongoose');
const { s3, getSignedUrl } = require('../aws');
const {v4: uuid} = require('uuid');
const mime = require('mime-types');

// const fileUnlink = promisify(fs.unlink);

imageRouter.post("/presigned", async (req, res) => {
  try{
    if(!req.user) throw new Error("권한이 없습니다.");
    const { contentTypes } = req.body;
    if(!Array.isArray(contentTypes)) throw new Error("invalid contentTypes");

    const presignedData = await Promise.all(
      contentTypes.map( async (contentType) => {
        const imageKey = `${uuid()}.${mime.extension(contentType)}`;
        const key = `raw/${imageKey}`;
        const presigned = await getSignedUrl({ key });
        return { imageKey, presigned };
      })
    );

    res.json(presignedData);
    
  }catch(err){
    console.log(err);
    res.status(400).json({message: err.message});
  }
})


// image라는 key로 저장된 값(파일)을 불러온다.
imageRouter.post("/", upload.array("image", 30), async (req, res) => {
  // 유저 정보, public 유무 확인
  try {
    if(!req.user) throw new Error("권한이 없습니다.");
    const { images, public } = req.body;
    const imageDocs = await Promise.all(
      images.map(
        (image) => 
          new Image({
            user:{
              _id: req.user.id,
              name: req.user.name,
              username: req.user.username,
            },
            public,
            key: image.imageKey,
            originalFileName: image.originalname
          }).save()
      )
    )
    res.json(imageDocs);
  } catch(err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }

});


// // image라는 key로 저장된 값(파일)을 불러온다.
// imageRouter.post("/", upload.array("image", 5), async (req, res) => {
//   // 유저 정보, public 유무 확인
//   try {
//     if(!req.user) throw new Error("권한이 없습니다.");
//     const images = await Promise.all(
//       req.files.map( async file => {
//         const image = await new Image({
//           user:{
//             _id: req.user.id,
//             name: req.user.name,
//             username: req.user.username,
//           },
//           public: req.body.public,
//           key: file.key.replace("raw/", ""),
//           originalFileName: file.originalname
//         }).save();
//         return image;
//       })
//     ) 
//     res.json(images);

//   } catch(err) {
//     console.log(err);
//     res.status(400).json({ message: err.message });
//   }

// });

imageRouter.get("/", async (req, res)=>{
  try{
    const { lastid } = req.query;
    if(lastid && !mongoose.isValidObjectId(lastid)) 
      throw new Error("invalid last id")
    // public 이미지들만 제공
    const images = await Image.find(
      lastid 
      ? 
      { public: true, _id: {$lt: lastid} }
      : 
      { public: true }
    )
    // 사진 정렬 순서 최신순
    .sort({ _id:-1 })
    .limit(20);
    res.json(images);
  }catch(err){
    console.log(err);
    res.status(400).json({message: err.message});
  }  
})

imageRouter.get("/:imageId",async(req, res) => {
  try{
    const { imageId } = req.params;
    if(!mongoose.isValidObjectId(imageId)) 
      throw new Error("올바르지 않은 이미지id입니다.");
    const image = await Image.findOne({ _id:imageId });
    if(!image) throw new Error("해당 이미지는 존재 하지 않습니다.");
    if(!image.public && (!req.user || req.user.id !== image.user.id)) 
      throw new Error("권한이 없습니다.");
    res.json(image);
  }catch(err){
    console.log(err);
    res.status(400).json({message: err.message});
  }
})

imageRouter.delete("/:imageId", async (req, res)=>{
  // 유저 권한 확인
  // 사진 삭제
  // 1. uploads 폴더에 있는 사진 데이터를 삭제
  // 2. 데이터베이스에 있는 image 문서를 삭제
  try{
    if(!req.user) throw new Error("권한이 없습니다.");
    if(!mongoose.isValidObjectId(req.params.imageId))
      throw new Error("올바르지 않은 이미지 id입니다.")

    const image = await Image.findOneAndDelete({_id: req.params.imageId});
    if(!image) return res.json({ message: "요청하신 사진은 이미 삭제되었습니다. "});
    // await fileUnlink(`./uploads/${image.key}`);
    s3.deleteObject(
      {Bucket: 'new-image-upload-tutorial', Key: `raw/${image.key}`}, 
      (error) => {
        if(error) throw error;
      }
    )
    res.json({ message: "요청하신 이미지가 삭제되었습니다.", image});
  }catch(err){
    console.log(err);
    res.status(400).json({message: err.message});
  }
})

imageRouter.patch("/:imageId/like", async (req, res) => {
  // 유저 권한 확인
  // like 중복 안되도록 확인
  try{
    if(!req.user) throw new Error("권한이 없습니다.");
    if(!mongoose.isValidObjectId(req.params.imageId))
      throw new Error("올바르지 않은 imageId입니다.")
    const image = await Image.findOneAndUpdate(
      {_id: req.params.imageId},
      {$addToSet: { likes: req.user.id }},
      { new: true }
    );
    res.json(image);
  }catch(err){
    console.log(err);
    res.status(400).json({message:err.message});
  }
})

imageRouter.patch("/:imageId/unlike", async (req, res) => {
  // 유저 권한 확인
  // like 중복 취소 안되도록 확인
  try{
    if(!req.user) throw new Error("권한이 없습니다.");
    if(!mongoose.isValidObjectId(req.params.imageId))
      throw new Error("올바르지 않은 imageId입니다.")
    const image = await Image.findOneAndUpdate(
      {_id: req.params.imageId},
      {$pull: { likes: req.user.id }},
      { new: true }
    );
    res.json(image);
  }catch(err){
    console.log(err);
    res.status(400).json({message:err.message});
  }
})

module.exports = { imageRouter };