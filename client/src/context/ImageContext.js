import axios from 'axios';
import React, {createContext, useContext, useEffect, useState} from 'react'
import { AuthContext } from './AuthContext';

export const ImageContext = createContext();

export const ImageProvider = (prop) => {
  const [images, setImages] = useState([]);
  const [myImages, setMyImages] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [me] = useContext(AuthContext);
  useEffect(()=> {
    axios
    .get("/images")
    .then((result) => setImages(result.data))
    .catch((err) => console.error(err))
  },[])

  useEffect(() => {
    if(me){  
      setTimeout(() =>{
        axios
          .get("/users/me/images")
          .then((result) => {setMyImages(result.data)})
          .catch((err)=>{console.log(err)});
      }, 0);
    }else{
      setMyImages([]);
      setIsPublic(true);
    }
  },[me])

  return (
    <ImageContext.Provider 
      value={{ 
        images, 
        setImages, 
        myImages, 
        setMyImages, 
        isPublic, 
        setIsPublic 
      }}
    >
      {prop.children}
    </ImageContext.Provider>
  )
}