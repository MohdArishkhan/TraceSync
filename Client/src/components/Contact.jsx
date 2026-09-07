import React, { useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import animationData from "../assets/animation/ani.json";
import axios from "axios";
import { useAppContext } from "../Context/AppContext";
import { ArrowLeft, Mail, Send, User, MessageSquare } from "lucide-react";

const Contact = ({ isLightMode }) => {
  const navigate = useNavigate();
  const { BACKEND_URL } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.email.trim() || !formData.name.trim() || !formData.message.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    axios
      .post(`${BACKEND_URL}/api/feedback/addFeedback`, formData)
      .then(() => {
        setFormData({ name: "", email: "", message: "" });
        toast.success("Feedback sent successfully!");
        setIsSubmitting(false);
      })
      .catch(() => {
        toast.error("Feedback could not be sent.");
        setIsSubmitting(false);
      });
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <section
      id="contact"
      className={`min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden ${
        isLightMode
          ? "bg-slate-50 bg-grid-pattern-light text-gray-900"
          : "bg-dark-bg bg-grid-pattern text-white"
      }`}
    >
      <Toaster position="top-center" />

      {/* Top Ambient Glow */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent-violet/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back Navigation */}
        <div className="flex justify-start mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-tech font-mono text-xs font-semibold border backdrop-blur-md transition-all duration-200 ${
              isLightMode
                ? "bg-white border-gray-200 text-gray-700 hover:border-accent-violet hover:text-accent-violet"
                : "bg-dark-surface border-dark-border text-gray-300 hover:border-accent-violet hover:text-white"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Form Section (6 cols) */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className={`p-6 sm:p-8 rounded-tech-lg border backdrop-blur-xl shadow-2xl ${
                isLightMode
                  ? "bg-white/90 border-gray-200 shadow-purple-500/5"
                  : "bg-dark-surface/90 border-dark-border shadow-black/80"
              }`}
            >
              <div className="space-y-2 mb-6">
                <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-accent-violet">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Get In Touch</span>
                </div>
                <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                  Contact the Team
                </h1>
                <p
                  className={`text-xs sm:text-sm font-sans leading-relaxed ${
                    isLightMode ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Have suggestions, feature requests, or questions? Send us a message and we'll reply promptly.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                  <label
                    className={`block font-mono text-xs font-semibold mb-1 ${
                      isLightMode ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Your Name
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-gray-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      value={formData.name}
                      name="name"
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g. Alex"
                      className={`w-full font-mono text-sm pl-9 pr-3 py-2.5 rounded-tech border transition-colors outline-none ${
                        isLightMode
                          ? "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-accent-violet"
                          : "bg-dark-bg/80 border-dark-border text-white placeholder-gray-500 focus:border-accent-violet"
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    className={`block font-mono text-xs font-semibold mb-1 ${
                      isLightMode ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-gray-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      value={formData.email}
                      name="email"
                      onChange={handleChange}
                      type="email"
                      placeholder="alex@example.com"
                      className={`w-full font-mono text-sm pl-9 pr-3 py-2.5 rounded-tech border transition-colors outline-none ${
                        isLightMode
                          ? "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-accent-violet"
                          : "bg-dark-bg/80 border-dark-border text-white placeholder-gray-500 focus:border-accent-violet"
                      }`}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    className={`block font-mono text-xs font-semibold mb-1 ${
                      isLightMode ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Message
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.message}
                      name="message"
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      rows="4"
                      className={`w-full font-mono text-sm p-3 rounded-tech border transition-colors outline-none ${
                        isLightMode
                          ? "bg-slate-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-accent-violet"
                          : "bg-dark-bg/80 border-dark-border text-white placeholder-gray-500 focus:border-accent-violet"
                      }`}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-tech font-mono text-sm font-semibold transition-all duration-200 bg-accent-violet hover:bg-accent-violet/90 text-white shadow-md shadow-accent-violet/20 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Sending..." : "Send Feedback"}</span>
                </button>
              </form>
            </div>
          </motion.div>

          {/* Animation Section (6 cols) */}
          <motion.div
            className="lg:col-span-6 flex justify-center"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-full max-w-lg">
              <Lottie
                animationData={animationData}
                loop={true}
                style={{
                  maxHeight: "480px",
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
