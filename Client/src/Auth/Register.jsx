import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { signUp } from "../lib/supabase";
import { motion } from "framer-motion";
import axios from "axios";

const Register = ({ isLightMode }) => {
  const Navigate = useNavigate();
  const [formData, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all details.");
      return;
    }

    setIsLoading(true);
    try {
      // ❌ DELETED the axios.post call to check-email. Supabase handles this!

      // 1. Call Supabase directly
      const response = await signUp(formData.email.trim(), formData.password, formData.name.trim());
      
      const error = response?.error;
      const user = response?.data?.user || response?.user;
      const session = response?.data?.session || response?.session;

      // 2. Handle explicit errors returned by Supabase
      if (error) {
        throw error;
      }

      // 3. The Magic Check: Catch existing users via Email Enumeration Protection
      if (user && user.identities && user.identities.length === 0) {
        toast.error("This email is already registered. Please sign in.");
        setIsLoading(false);
        return; // Stop execution so it doesn't redirect
      }

      // 4. Success state
      setFormdata({ name: "", email: "", password: "" });
      toast.success(session ? "Account created successfully." : "Check your email to confirm your account.");
      Navigate("/LoginPage");
      
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e) {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden ${
        isLightMode ? "bg-slate-50" : "bg-zinc-950"
      }`}
    >
      <Toaster position="top-center" />

      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className={`w-full rounded-xl p-8 border shadow-sm transition-colors duration-300 ${
            isLightMode
              ? "bg-white border-gray-200 shadow-gray-200/50"
              : "bg-zinc-900 border-zinc-800 shadow-black/50"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2
              className={`text-2xl font-bold tracking-tight mb-2 ${
                isLightMode ? "text-gray-900" : "text-gray-100"
              }`}
            >
              Create Account
            </h2>
            <p className={`text-sm ${isLightMode ? "text-gray-500" : "text-gray-400"}`}>
              Sign up to start collaborating in TraceSync.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium mb-1.5 ${
                  isLightMode ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Full Name
              </label>
              <div className="relative">
                <FiUser
                  className={`absolute top-1/2 left-3 transform -translate-y-1/2 text-lg pointer-events-none ${
                    isLightMode ? "text-gray-400" : "text-zinc-500"
                  }`}
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-md transition-all border outline-none ${
                    isLightMode
                      ? "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                      : "bg-zinc-950 border-zinc-700 text-gray-100 placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-1.5 ${
                  isLightMode ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className={`absolute top-1/2 left-3 transform -translate-y-1/2 text-lg pointer-events-none ${
                    isLightMode ? "text-gray-400" : "text-zinc-500"
                  }`}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-md transition-all border outline-none ${
                    isLightMode
                      ? "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                      : "bg-zinc-950 border-zinc-700 text-gray-100 placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-1.5 ${
                  isLightMode ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className={`absolute top-1/2 left-3 transform -translate-y-1/2 text-lg pointer-events-none ${
                    isLightMode ? "text-gray-400" : "text-zinc-500"
                  }`}
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-md transition-all border outline-none ${
                    isLightMode
                      ? "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                      : "bg-zinc-950 border-zinc-700 text-gray-100 placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                isLightMode
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-white text-zinc-900 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Creating account..." : "Register"}
            </button>
          </form>
          
          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${isLightMode ? "text-gray-600" : "text-gray-400"}`}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => Navigate("/LoginPage")}
                className={`font-medium transition-colors ${
                  isLightMode 
                    ? "text-gray-900 hover:underline" 
                    : "text-white hover:underline"
                }`}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;