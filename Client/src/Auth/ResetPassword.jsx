import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = ({ isLightMode, setisLightMode }) => {  
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("registeredEmail");
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const Navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleReset = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in both fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const myData = {
      email,
      password
    }

    axios.put(`${BACKEND_URL}/api/auth/resetPassword`,myData).then(()=>{
      // console.log("Data sent to backend");
    }).catch((e)=>{
      // console.log("Data not sent to Backend");
    });
    
    setPassword('');
    setConfirmPassword('');
    Navigate("/");

  };

  return (
    <div className={`min-h-screen ${isLightMode?"bg-gray-100":"bg-black"} flex items-center justify-center px-4`}>
      <div className={`rounded-xl ${isLightMode?"bg-white":"bg-gray-950"}  shadow-xl p-10 w-full max-w-lg`}>
        <h2 className={`text-2xl lg:text-3xl font-bold mb-6 text-center ${isLightMode?"text-gray-800":"text-white"}`}>
          Reset Your Password
        </h2>

        <form onSubmit={handleReset} className="space-y-6">
          {/* New Password */}
          <div>
            <label className={`text-center lg:text-start block ${isLightMode?"text-gray-700":"text-white"} font-medium mb-2`}>
              New Password
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center  ${isLightMode?"text-blue-600":"text-green-600"}`}>
                <FiLock className="text-lg" />
              </div>
              <input
                type="password"
                placeholder="Enter new password"
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${isLightMode?"focus:ring-blue-500":"focus:ring-green-500"} `}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className={`text-center lg:text-start block ${isLightMode?"text-gray-700":"text-white"} font-medium mb-2`}>
              Confirm New Password
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center ${isLightMode?"text-blue-600":"text-green-600"}`}>
                <FiLock className="text-lg" />
              </div>
              <input
                type="password"
                placeholder="Confirm new password"
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${isLightMode?"focus:ring-blue-500":"focus:ring-green-500"}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full ${isLightMode?"bg-blue-600 hover:bg-blue-700":"bg-green-600 hover:bg-green-700"} text-white py-3 rounded-lg hover:cursor-pointer font-semibold  transition`}
          >
            Reset Password
          </button>
        </form>

        <Toaster />
      </div>
    </div>
  );
};

export default ResetPassword;
