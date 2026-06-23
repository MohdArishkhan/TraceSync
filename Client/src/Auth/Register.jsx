import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";

const Register = ({ isLightMode, setisLightMode }) => {
  const Navigate = useNavigate();
  const { BACKEND_URL, setisLoggedIn, isLoggedIn, userData, getUserData } = useAppContext();
  const [formData, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    // BYPASS - Auto register without checking
    toast.success("Registered Successfully...");
    setTimeout(() => {
      Navigate("/LoginPage");
    }, 500);

    await axios
      .post(`${BACKEND_URL}/api/auth/register`, formData, {
        withCredentials: true,
      })
      .then((myData) => {
        // console.log("Form data sent to Backend: ", myData.data);
        setFormdata({ name: "", email: "", password: "" });

        // if (myData.data.status === 1) {
          toast.success("Registered Successfully...");
          // setisLoggedIn(true);
          // getUserData();
          Navigate("/LoginPage");
        // } else {
          // toast.error("Registration not done...");
          // setisLoggedIn(false);
        // }
      })
      .catch((e) => {
        // console.log(`Form data not sent to Backend...`);
        toast.error("Something went wrong...");
      });
  }

  function handleChange(e) {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  }

  function showToaster() {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error(`Please fill all details.`);
    }
  }

  useEffect(() => {
    // console.log("Form Data Updated: ", formData);
  }, [formData]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 ${
        isLightMode ? "bg-gray-100" : "bg-black"
      }`}
    >
      <div
        className={`w-full max-w-md sm:max-w-lg md:max-w-xl rounded-xl shadow-xl p-6 sm:p-8 md:p-10 ${
          isLightMode ? "bg-white" : "bg-gray-950"
        }`}
      >
        <h2
          className={`text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 ${
            isLightMode ? "text-gray-800" : "text-white"
          }`}
        >
          Create Your Account
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className={`block text-sm font-medium mb-2 ${
                isLightMode ? "text-gray-700" : "text-green-400"
              }`}
            >
              Name
            </label>
            <div className="relative">
              <FiUser
                className={`absolute top-1/2 left-3 transform -translate-y-1/2 text-lg ${
                  isLightMode ? "text-blue-600" : "text-green-600"
                }`}
              />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-transparent focus:outline-none focus:ring-2 ${
                  isLightMode
                    ? "text-black focus:ring-blue-500"
                    : "text-green-400 focus:ring-green-500"
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium mb-2 ${
                isLightMode ? "text-gray-700" : "text-green-400"
              }`}
            >
              Email
            </label>
            <div className="relative">
              <FiMail
                className={`absolute top-1/2 left-3 transform -translate-y-1/2 text-lg ${
                  isLightMode ? "text-blue-600" : "text-green-600"
                }`}
              />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-transparent focus:outline-none focus:ring-2 ${
                  isLightMode
                    ? "text-black focus:ring-blue-500"
                    : "text-green-400 focus:ring-green-500"
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium mb-2 ${
                isLightMode ? "text-gray-700" : "text-green-400"
              }`}
            >
              Password
            </label>
            <div className="relative">
              <FiLock
                className={`absolute top-1/2 left-3 transform -translate-y-1/2 text-lg ${
                  isLightMode ? "text-blue-600" : "text-green-600"
                }`}
              />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-transparent focus:outline-none focus:ring-2 ${
                  isLightMode
                    ? "text-black focus:ring-blue-500"
                    : "text-green-400 focus:ring-green-500"
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <button
              type="submit"
              onClick={showToaster}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white transition ${
                isLightMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              Register
            </button>

            <button
              type="button"
              className={`text-sm hover:underline ${
                isLightMode ? "text-blue-600" : "text-green-400"
              }`}
            >
              <button onClick={()=>Navigate("/LoginPage")} type="button">Already have an account?</button>
            </button>
          </div>
        </form>

        <Toaster />
      </div>
    </div>
  );
};

export default Register;
