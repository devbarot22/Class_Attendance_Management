import React, { useState } from "react"
import Logo from "../svg/Logo.svg"
import { Link } from "react-router-dom"
import UserProfile from "./UserProfile"
import { IoMenu } from "react-icons/io5";
import SideNav from "./SideNav";

const TopNavbar = ({ authUser }: { authUser: any }) => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  return (
    <>
      <div className="max-sm:hidden relative right-0">
        <nav className="absolute right-0 h-16 z-50">
          <UserProfile authUser={authUser}/>
        </nav>
      </div>


      <div className="sm:hidden">
        <nav className="flex items-center h-16 min-w-screen justify-between bg-gray-200">
          <i onClick={toggleSideNav}><IoMenu className="size-6 cursor-pointer ml-4 text-center" /></i>
          <Link to='/MainPage'><img src={Logo} alt="Logo" className="cursor-pointer" /></Link>
          <UserProfile authUser={authUser} />
        </nav>
        {isSideNavOpen && <SideNav isOpen={isSideNavOpen} />}
      </div>
    </>
  )
}

export default TopNavbar