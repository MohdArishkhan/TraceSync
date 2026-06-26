import React, { useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // 1. Imported useNavigate
import animationData from "../assets/animation/ani.json";
import axios from "axios";
import { useAppContext } from "../Context/AppContext";

const Contact = ({ isLightMode }) => {
  const navigate = useNavigate(); // 2. Initialized navigate
  const { BACKEND_URL } = useAppContext();
  const [formData, setFormdata] = useState({
    name: "",
    email: "",
    message: "",
  });

  // 3. Consolidated submit logic into handleSubmit for better UX (Enter key support)
  function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.message) {
      toast.error("Please fill out all fields.");
      return;
    } 

    axios
      .post(`${BACKEND_URL}/api/feedback/addFeedback`, formData)
      .then((res) => {
        setFormdata({
          name: "",
          email: "",
          message: "",
        });
        toast.success("Feedback sent successfully!");
      })
      .catch((e) => {
        toast.error("Feedback not Sent !");
      });
  }

  function handleChange(e) {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <section
      id="contact"
      className={`py-12 lg:py-10 text-white ${
        isLightMode ? "bg-white" : "bg-gray-950"
      } min-h-screen w-full h-fit overflow-x-hidden`}
    >
      <div className="container mx-auto px-10 lg:px-4">
        
        {/* --- BACK NAVIGATION BUTTON --- */}
        <div className="w-full flex justify-start mb-6 lg:mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:-translate-x-1 active:scale-95 ${
              isLightMode
                ? "bg-white text-gray-800 shadow-md hover:shadow-lg border border-gray-200"
                : "bg-gray-900 text-white shadow-md hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-gray-800 hover:border-gray-700"
            }`}
          >
            <i className="ri-arrow-left-line text-xl"></i>
            Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Form Section */}
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3
              className={`${
                isLightMode ? "text-gray-950" : ""
              } text-3xl font-semibold text-center lg:text-start mb-6`}
            >
              Contact Us
            </h3>
            <p
              className={`text-1xl text-center lg:text-start lg:text-lg mb-8 ${
                isLightMode ? "text-gray-950" : ""
              }`}
            >
              Have any questions, suggestions, or feedback? Feel free to reach
              out — we’d love to hear from you.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                value={formData.name}
                name="name"
                onChange={handleChange}
                type="text"
                placeholder="Your Name"
                className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-lg border border-gray-500 bg-gray-800 placeholder-gray-400 ${
                  isLightMode
                    ? "border-slate-500 bg-transparent text-black placeholder-blue-400"
                    : "border-gray-500 bg-gray-800 text-white placeholder-gray-400"
                }`}
              />
              <input
                value={formData.email}
                name="email"
                onChange={handleChange}
                type="email"
                placeholder="Your Email"
                className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-lg border border-gray-500 bg-gray-800 placeholder-gray-400 ${
                  isLightMode
                    ? "border-slate-500 bg-transparent text-black placeholder-blue-400"
                    : "border-gray-500 bg-gray-800 text-white placeholder-gray-400"
                }`}
              />
              <textarea
                value={formData.message}
                name="message"
                onChange={handleChange}
                placeholder="Your Message"
                className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-lg border border-gray-500 bg-gray-800 placeholder-gray-400 ${
                  isLightMode
                    ? "border-slate-500 text-black bg-transparent placeholder-blue-400"
                    : "border-gray-500 bg-gray-800 text-white placeholder-gray-400"
                }`}
                rows="5"
              />
              <button
                type="submit" // Triggered by form onSubmit
                className={`w-full ${
                  isLightMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                } transition duration-300 text-white py-2 lg:py-3 rounded-full font-light lg:font-semibold`}
              >
                Submit
              </button>
              <Toaster />
            </form>
          </motion.div>

          {/* Lottie Animation Section */}
          <motion.div
            className="w-full md:w-1/2 flex justify-center md:justify-end"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-full h-auto max-w-2xl mt-10 md:mt-20">
              <Lottie
                animationData={animationData}
                loop={true}
                style={{
                  maxHeight: "600px",
                  width: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;