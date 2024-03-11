import SignUp from "./SignUp";
import SignIn from "./SignIn";
import React from "react";

const AuthPage = () => {
  return (
      <div className="flex justify-between">
        <SignUp />
        <SignIn />
      </div>
  )
}

export default AuthPage;