import React, { useState } from "react";
import Logo from "@/svg/Logo.svg";

const SideNav = ({ isOpen }: { isOpen: boolean }) => {
  const [cIsHovered, setCIsHovered] = useState(false);
  const [aIsHovered, setAIsHovered] = useState(false);

  const sideNavStyle: React.CSSProperties = {
    position: "fixed",
    top: 63,
    left: 0,
    width: "150px",
    height: "100%",
    background: "#333",
    color: "#fff",
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 500ms ease-in-out",
  };

  const dropdownStyle: React.CSSProperties = {
    maxHeight: cIsHovered ? "500px" : "0",
    opacity: cIsHovered ? 1 : 0,
    overflow: "hidden",
    transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
  };

  const dropdownStyleA: React.CSSProperties = {
    maxHeight: aIsHovered ? "500px" : "0",
    opacity: aIsHovered ? 1 : 0,
    overflow: "hidden",
    transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
  };

  const secondCoordinatorStyle: React.CSSProperties = {
    marginTop: cIsHovered ? '99px' : '0',
    transition: 'margin-top 0.3s ease-in-out',
  };


  return (
    <>
      <div>
        <div
          style={sideNavStyle}
          className="flex h-[100vh] z-50 bg-slate-500 sm:hidden">
          <ul className="flex flex-col min-w-full">
            <li className="text-center font-semibold text-[1rem] mt-5 cursor-pointer">
              Coordinator DashBoard
            </li>
            <hr className="mt-5" />
            <li className="text-center font-semibold text-[1rem] mt-5 cursor-pointer">
              Attendee DashBoard
            </li>
            <hr className="mt-5" />
          </ul>
        </div>

        <div className="flex flex-col bg-slate-500 w-[13vw] h-[100vh] max-sm:hidden">
          <ul className="flex flex-col min-w-full">
            <div className="flex justify-center w-full">
              <img src={Logo} alt="Logo" className="h-16 pt-2" />
            </div>
            <li
              className="cursor-pointer relative group w-full border-t-2 border-b-2 pb-8 pt-8"
              onMouseEnter={() => setCIsHovered(true)}
              onMouseLeave={() => setCIsHovered(false)}>
              <h1 className="text-base font-semibold w-full text-center">Coordinator DashBoard</h1>
              <ul
                style={dropdownStyle}
                className="absolute w-full left-0 mt-2 pl-4 font-serif text-sm bg-slate-500 border-b-2">
                <li className="bg-slate-500 py-2">Data Dump</li>
                <li className="bg-slate-500 py-2">xyz</li>
                <li className="bg-slate-500 py-2">xyz</li>
              </ul>
            </li>
          </ul>
          <ul
            className="flex flex-col min-w-full"
            style={secondCoordinatorStyle}>
            <li
              className="cursor-pointer relative group w-full border-b-2 pb-8 pt-8"
              onMouseEnter={() => setAIsHovered(true)}
              onMouseLeave={() => setAIsHovered(false)}>
              <h1 className="text-base font-semibold w-full text-center">Attendee DashBoard</h1>
              <ul
                style={dropdownStyleA}
                className="absolute w-full left-0 mt-2 pl-4  font-serif text-sm bg-slate-500 border-b-2">
                <li className="bg-slate-500 p-2">xyz</li>
                <li className="bg-slate-500 p-2">xyz</li>
                <li className="bg-slate-500 p-2">xyz</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default SideNav;
