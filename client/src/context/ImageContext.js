import axios from 'axios';
import React, {createContext, useEffect, useState} from 'react'

export const ImageContext = createContext();

export const ImageProvider = (prop) => {
  const [images, setImages] = useState([]);
  useEffect(()=> {
    axios
    .get("/images")
    .then((result) => setImages(result.data))
    .catch((err) => console.error(err))
  },[])
  return (
    <ImageContext.Provider value={[images, setImages]}>
      {prop.children}
    </ImageContext.Provider>
  )
}