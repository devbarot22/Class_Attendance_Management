import React from "react"
import Logo from "../svg/attend-logo-vector.svg"
import { Link } from "react-router-dom"
import UserProfile from "./UserProfile"

const TopNavbar = ({ authUser }: { authUser: any }) => {
  return (
    <>
      <nav className="flex items-center h-16 min-w-screen justify-between bg-gray-200">
        <Link to='/MainPage'><img src={Logo} alt="Logo" className="cursor-pointer w-20 ml-4 right-0" /></Link>
        <div className="text-3xl">Class Attendance Management</div>
        <UserProfile authUser={authUser} />
      </nav>

    </>
  )
}

export default TopNavbar