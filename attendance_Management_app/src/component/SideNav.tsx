import React from "react"

const SideNav = () => {
  return (
    <>
      <div className="flex w-[12vw] h-[calc(100vh-4rem)]">
        <ul className="flex flex-col min-w-full bg-slate-500">
          <li className="text-md text-center mt-5">Teacher DashBoard</li>
          <hr className="mt-5 mb-5" />
        </ul>
      </div>
    </>
  )
}

export default SideNav