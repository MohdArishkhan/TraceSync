import React from 'react'
// import Avatar from 'react-avatar';

function Client({username,socketid,isLightMode}) {
  return (
    <li className="flex flex-row gap-2 lg:gap-5 items-center">
      <p className={` rounded-full p-1 lg:p-3 px-3 lg:px-5 ${isLightMode?"bg-black text-white":"bg-white text-black"}`}>{username[0].toUpperCase()}</p>
      <span className={`${isLightMode?"text-blue-800":"text-white"} text-sm text-light lg:text-semibold`}>{username.toString()}</span>
    </li>
  )
}

export default Client