import React from 'react'
import ImageList from '../components/ImageList'
import UploadForm from '../components/UploadForm'

const MainPage = () => {
  return (
    <div>
      <h2>사진첩</h2>
      <UploadForm />
      <ImageList />
    </div>
  )
}

export default MainPage