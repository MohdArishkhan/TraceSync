import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyEmail = ({ isLightMode }) => {
  const [otp, setOtp] = useState("");
  const { BACKEND_URL } = useAppContext();
  const Navigate = useNavigate();

  const submitOTP = async () => {
    await axios
      .post(`${BACKEND_URL}/api/auth/verifyEmail`, { otp }, { withCredentials: true })
      .then((res) => {
        toast.success("Verification Done Successfully..");
        Navigate("/");
      })
      .catch((e) => {
        toast.error("OTP is Incorrect!");
      });
  };

  useEffect(() => {
    axios
      .post(`${BACKEND_URL}/api/auth/sendVerifyOTP`, {}, { withCredentials: true })
      .then(() => {
        toast.success("OTP sent to your Email");
      })
      .catch(() => {
        toast.error("Internal Error in sending OTP");
      });
  }, []);

  return (
    <>
      <Toaster />
      <div className={`w-screen h-screen flex items-center justify-center px-4 ${isLightMode ? "bg-gradient-to-br from-blue-100 via-white to-blue-200" : "bg-black"}`}>
        <div className={`w-full max-w-md rounded-2xl p-8 border shadow-lg flex flex-col items-center gap-6 
          ${isLightMode ? "bg-white border-gray-300" : "bg-gray-950 border-gray-700"}`}>
          
          <h2 className={`text-2xl lg:text-3xl font-bold text-center ${isLightMode ? "text-gray-800" : "text-white"}`}>
            Verify Your Email
          </h2>

          <p className={`text-sm text-center ${isLightMode ? "text-gray-600" : "text-gray-300"}`}>
            Please enter the OTP sent to your email address.
          </p>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 
              ${isLightMode 
                ? "border-gray-300 text-gray-800 focus:ring-blue-500" 
                : "border-gray-600 text-white bg-gray-900 focus:ring-green-500"}`}
          />

          <button
            onClick={submitOTP}
            className={`w-full text-white font-medium py-2 rounded-md transition active:scale-95 
              ${isLightMode 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-green-600 hover:bg-green-700"}`}
          >
            Verify OTP
          </button>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
