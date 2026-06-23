import React, { useState } from "react";
import "../App.css";
function Features({ isLightMode, setisLightMode }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const obj = [
    {
      td1: "Real-time Collaboration",
      td2: "Yes",
      td3: "Limited",
      td4: "No",
    },
    {
      td1: "Chat-Bot AI Assistant",
      td2: "Yes",
      td3: "Yes",
      td4: "No",
    },
    {
      td1: "Code Reviewer",
      td2: "Yes",
      td3: "No",
      td4: "Yes",
    },
    {
      td1: "Cloud Storage & Version Control",
      td2: "Yes",
      td3: "No",
      td4: "Yes",
    },
    {
      td1: "Real Time Meeting",
      td2: "Yes",
      td3: "No",
      td4: "Yes",
    },
    {
      td1: "Live Chat with video call",
      td2: "Yes",
      td3: "No",
      td4: "Yes",
    },
    {
      td1: "Customizable Themes",
      td2: "Yes",
      td3: "No",
      td4: "Limited",
    },
  ];

  return (
    <div
      className={`h-auto flex justify-center items-center ${
        isLightMode ? "bg-white" : "bg-black"
      } p-4`}
    >
      <div className="flex flex-col items-center relative w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div
          className={`flex  lg:flex-row justify-center items-center 
    ${isLightMode ? "bg-gray-100" : "bg-gray-800"} 
    rounded-3xl lg:rounded-full gap-4 py-2 px-4 mt-4`}
        >
          {["Overview", "Features", "Compare"].map((tab) => (
            <button
              key={tab}
              className={`font-semibold text-sm lg:text-lg px-3 py-2 lg:px-6 lg:py-3 rounded-full transition-all duration-300 focus:outline-none ${
                activeTab === tab
                  ? `${
                      isLightMode ? "text-blue-700" : "text-green-500"
                    } bg-white shadow-md`
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className={`w-full mt-12 rounded-xl p-8 shadow-lg ${
            isLightMode ? "bg-white" : "bg-gray-950"
          } hover:duration-200 transition-all transform`}
        >
          {/* Overview Tab */}
          {activeTab === "Overview" && (
            <div className="flex flex-col sm:flex-row items-center gap-12">
              <div className="w-full sm:w-2/3">
                <h1
                  className={`text-center text-2xl sm:text-5xl lg:text-left font-bold ${
                    isLightMode ? "text-blue-600" : "text-green-500"
                  }  mb-6`}
                >
                  Seamless Live Code Collaboration
                </h1>
                <p
                  className={`text-sm lg:text-lg sm:text-xl ${
                    isLightMode ? "text-gray-700" : "text-white"
                  }`}
                >
                  Build, test, and share code in real time with developers
                  across the globe. Our platform provides an intuitive interface
                  where you can collaborate effortlessly, making coding more
                  interactive and efficient than ever. Whether you’re working on
                  a project, pair-programming, or teaching, our live code editor
                  ensures smooth real-time collaboration with instant feedback.
                </p>
              </div>
              <div className="w-full sm:w-1/3 lg:mt-8 sm:mt-0">
                <img
                  src="https://as1.ftcdn.net/v2/jpg/05/90/69/48/1000_F_590694807_9gUwFh5724mN6TFEnnLwY6X2PznLXZZL.jpg"
                  alt="Collaboration"
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "Features" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                {
                  title: "Real-time Code Sharing",
                  description:
                    "Instantly share your code with teammates and see changes in real-time. No more endless screenshots or copy-pasting code!",
                },
                {
                  title: "Multi-Language Support",
                  description:
                    "Write in multiple programming languages, from JavaScript to C++ and beyond.",
                },
                {
                  title: "Live Collaboration & Chat",
                  description:
                    "Communicate directly within the editor. Add comments, chat with teammates, and debug code together.",
                },
                {
                  title: "Cloud Storage & Version Control",
                  description:
                    "Never lose progress! Save your code and track changes effortlessly.",
                },
                {
                  title: "Secure & Private Rooms",
                  description:
                    "Create password-protected rooms to ensure only invited collaborators can access your code.",
                },
                {
                  title: "Debugging & Error Tracking",
                  description:
                    "Identify issues faster with an integrated debugging console and error-highlighting features.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 ${
                    isLightMode ? "" : "bg-gray-900"
                  } rounded-lg shadow-md hover:bg-slate-100 cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out transform hover:shadow-xl border ${
                    isLightMode ? "" : "border-green-400"
                  }`}
                >
                  <h2
                    className={`text-center lg:text-left text-1xl sm:text-2xl font-semibold text-black mb-4 ${
                      isLightMode ? "" : "text-green-400"
                    }`}
                  >
                    {feature.title}
                  </h2>
                  <p
                    className={`text-center lg:text-left lg:text-lg sm:text-xl text-gray-600 ${
                      isLightMode ? "" : ""
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Compare Tab */}
          {activeTab === "Compare" && (
            <div className="overflow-x-auto p-6 hide-scrollbar">
              <table
                className={`w-full max-w-screen-lg hide-scrollbar mx-auto text-left border-separate border-spacing-y-4  shadow-lg rounded-xl ${
                  isLightMode ? "bg-white" : "bg-gray-900"
                }`}
              >
                <thead
                  className={`${
                    isLightMode ? "bg-blue-800" : "bg-green-500"
                  } text-white`}
                >
                  <tr>
                    <th className="py-4 px-6 text-lg">Feature</th>
                    <th className="py-4 px-6 text-lg">CodeDoodle</th>
                    <th className="py-4 px-6 text-lg">CodeLogic</th>
                    <th className="py-4 px-6 text-lg">Codeseva</th>
                  </tr>
                </thead>
                <tbody
                  className={`${
                    isLightMode ? "text-gray-900" : "text-white"
                  } text-lg`}
                >
                  {obj.map((item, index) => (
                    <tr
                      key={index}
                      className={`transition-all duration-300 ${
                        isLightMode ? "hover:bg-gray-100" : "hover:bg-gray-800"
                      }`}
                    >
                      <td className="py-4 px-6">{item.td1}</td>
                      <td className="py-4 px-6 text-green-600">{item.td2}</td>
                      <td className="py-4 px-6 text-red-600">{item.td3}</td>
                      <td className="py-4 px-6 text-yellow-600">{item.td4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Features;
