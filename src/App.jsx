import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientFileUploadForm from "./pages/FileUpload";
import SearchDocuments from "./pages/SearchDocuments.jsx";
import { ThemeProvider, createTheme } from "@mui/material";
import { FileAccessContextProvider } from "./contexts/FileAccess.jsx";

const theme = createTheme({});

function App() {
  return (
    <>
      <FileAccessContextProvider>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fileUpload" element={<PatientFileUploadForm />} />
              <Route path="/searchDocuments" element={<SearchDocuments />} />
              <Route path="*" element={<Auth />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </FileAccessContextProvider>
    </>
  );
}

export default App;
