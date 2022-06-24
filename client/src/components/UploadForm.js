import React, {useState} from 'react';
import axios from 'axios';
import './UploadForm.css';
import {toast} from 'react-toastify';
import ProgressBar from './ProgressBar';

const UploadForm = () => {
  const defaultFileName = "이미지 파일을 업로드 해주세요."
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(defaultFileName);
  const [percent, setPercent] = useState(0);

  const imageSelectHandler = (e) => {
    const imageFile = e.target.files[0];
    setFile(imageFile);
    setFileName(imageFile.name);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", file);
    try{
      const res = await axios.post("/upload", formData, {
        headers: { "Content-Type" : "multipart/form-data"},
        onUploadProgress: (e) => {
          setPercent(Math.round((100 * e.loaded) / e.total))
        },
      });
      console.log({res});
      toast.success("이미지 업로드 성공!")
      setTimeout(() => {
        setPercent(0);
        setFileName(defaultFileName)
      }, 3000)
    }catch(e){
      toast.error(e.message);
      setPercent(0);
      setFileName(defaultFileName)
      console.error(e);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <ProgressBar percent={percent} />
        <div className="file_dropper">
          {fileName}
          <input id="image" type="file" onChange={imageSelectHandler}/>
        </div>
        <button type="submit" className="btn_input">제출</button>
      </form>
  </div>
  )
}

export default UploadForm