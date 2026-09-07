import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { signUp } from "../lib/supabase";

const Register = ({ isLightMode }) => {
  const Navigate = useNavigate();
  const [formData, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all details.");
      return;
    }

    try {
      const { session } = await signUp(formData.email, formData.password, formData.name);
      setFormdata({ name: "", email: "", password: "" });
      toast.success(session ? "Account created successfully." : "Check your email to confirm your account.");
      Navigate("/LoginPage");
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    }
  }

  function handleChange(e) {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  }

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
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white transition ${
                isLightMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              Register
            </button>

            <button onClick={() => Navigate("/LoginPage")} type="button" className={`text-sm hover:underline ${
              isLightMode ? "text-blue-600" : "text-green-400"
            }`}>
              Already have an account?
            </button>
          </div>
        </form>

        <Toaster />
      </div>
    </div>
  );
};

export default Register;
