import SignUp from "./SignUp";
import SignIn from "./SignIn";
import React, { useState } from "react";

const AuthPage = () => {
  const [showSignUp, setShowSignUp] = useState(true);

  const toggleForm = () => {
    setShowSignUp(!showSignUp);
  };

  return (
    <>
      <div className="max-md:hidden flex justify-between">
        <SignUp />
        <SignIn />
      </div>

      <div className="max-md:block hidden">
        {showSignUp ? (
          <SignUp toggleForm={toggleForm} />
        ) : (
          <SignIn toggleForm={toggleForm} />
        )}
      </div>
    </>
  )
}

export default AuthPage;