import React from 'react'
import FAQ from "../components/FAQ.jsx";

function About({isLightMode,setisLightMode}) {
  return (
    <div>
      <FAQ isLightMode={isLightMode} setisLightMode={setisLightMode}/>
    </div>
  )
}

export default About
