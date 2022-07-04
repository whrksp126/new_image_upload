import React, { useEffect, useState } from 'react'
import axios from 'axios'

const ImageList = () => {
  const [images, setImages] = useState([]);
  useEffect(()=> {
    axios.get("/images").then((result) => setImages(result.data))
      .catch((err) => console.error(err))
  },[])

  const ImgList = images
    .map((image) => 
      <img 
        style={{width: '100%'}} 
        src={`http://localhost:5000/uploads/${image.key}`} 
        alt="img_list"  
      />
    )

  return (
    <div>
      <h3>Image List</h3>
      {ImgList}
    </div>
  )
}

export default ImageList