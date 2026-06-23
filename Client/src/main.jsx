import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./App.css";
import "./index.css";
import { FileDataProvider } from "./Context/FileDataContext";
import { SocketProvider } from "../src/CameraSecurity/context/SocketProvider.jsx";
import { AppProvider } from "./Context/AppContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <AppProvider>
        <FileDataProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </FileDataProvider>
      </AppProvider>
    </BrowserRouter>
  </>
);
