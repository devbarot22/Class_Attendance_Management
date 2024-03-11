import { ToastContainer } from "react-toastify";
import MainPage from "./component/MainPage";
import 'firebase/compat/firestore';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from "./component/UserContext";
import { Route, Routes } from 'react-router-dom';
import React from "react";
import AuthPage from "./component/AuthPage";
import { Navigate } from "react-router-dom";
import VerifyingEmail from "./component/VerifyingEmail";


function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path='/AuthPage' element={<AuthPage />} />
          <Route path='/MainPage' element={<MainPage />} />
          <Route path='/*' element={<Navigate to="/AuthPage" replace />} />
          <Route path="/VerifyingEmail" element={<VerifyingEmail />} />
        </Routes>
      </Router>
      <ToastContainer />
    </UserProvider>
  );
}

export default App