import axios from "axios";
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiKey } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const EnterOTPforPassword = ({ isLightMode, setisLightMode }) => {
  const location = useLocation();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const email =
    location.state?.email || localStorage.getItem("registeredEmail");

  // console.log(`Email is : ${email}`);

  const Navigate = useNavigate();
  const [otp, setOtp] = useState("");

  function sentToBackend() {
    axios
      .post(`${BACKEND_URL}/api/auth/verifyOTPforPasswordReset/`,{email})
      .then(() => {
        // console.log(`Email sent to Backend to send OTP for reset Password`);
        toast.success("Email submitted. Please check your inbox.");
        localStorage.setItem("registeredEmail", email);
        Navigate("/EnterOTPforPassword");
      })
      .catch((e) => {
        // console.log(
          // `Email does sent to Backend to send OTP for reset Password`
        // );
      });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    const myData = {
      email: email,
      otp: otp,
    };

    axios
      .post(
        `${BACKEND_URL}/api/auth/CheckverifyOTPforPasswordReset`,
        myData
      )
      .then((res) => {
        // console.log(`Sent to Backend`);
        // console.log(res.data);
        if (res.data.status === 1) {
          Navigate("/ResetPassword");
        } else {
          setOtp("");
          toast.error("OTP is incorrect");
          Navigate("/EnterOTPforPassword");
        }
      })
      .catch((e) => {
        // console.log(`Not Sent to Backend : ${e.message}`);
      });
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${isLightMode?"bg-gray-100":"bg-black"} px-4`}>
      <div className={`${isLightMode ? "bg-white" : "bg-gray-950"} shadow-xl rounded-xl p-10 w-full max-w-lg`}>
        <h2 className={`text-3xl font-bold text-center mb-8 ${isLightMode?"text-gray-800":"text-white"}`}>
          Enter OTP
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center ${isLightMode?"text-blue-600":"text-green-600"}`}>
                <FiKey className="text-lg" />
              </div>
              <input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${isLightMode?"focus:ring-blue-500":"focus:ring-green-500"}`}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${isLightMode?"bg-blue-600 hover:bg-blue-700":"bg-green-600 hover:bg-green-700"} text-white px-6 py-3 rounded-lg  transition hover:cursor-pointer`}
          >
            Submit OTP
          </button>
          <Toaster />
          <button
            type="button"
            className={`${isLightMode?"text-blue-600":"text-green-600"} hover:underline text-sm hover:cursor-pointer flex justify-center items-center w-full`}
            onClick={()=>sentToBackend()}
          >
            Resend OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterOTPforPassword;
