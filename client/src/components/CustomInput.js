import React from 'react'

const CustomInput = ({label, value, setValue , type}) => {
  return (
    <div>
      <label>{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
        style={{width:"100%"}}
      />
    </div>

  )
}

export default CustomInput