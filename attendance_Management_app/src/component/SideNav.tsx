import React from "react"

const SideNav = ({ isOpen }: { isOpen: boolean }) => {
  const sideNavStyle: React.CSSProperties = {
    position: 'fixed',
    top: 63,
    left: 0,
    width: '150px',
    height: '100%',
    background: '#333',
    color: '#fff',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 500ms ease-in-out'
  };

  return (
    <>
      <div style={sideNavStyle} className="flex h-[calc(100vh-4rem)] z-10 sm:hidden">
        <ul className="flex flex-col min-w-full bg-slate-500">
          <li className="text-center mt-5">Teacher DashBoard</li>
          <hr className="mt-5 mb-5" />
        </ul>
      </div>

      <div className="flex w-[12vw] h-[calc(100vh-4rem)] max-sm:hidden">
        <ul className="flex flex-col min-w-full bg-slate-500">
          <li className="text-center mt-5">Teacher DashBoard</li>
          <hr className="mt-5 mb-5" />
        </ul>
      </div>
    </>
  )
}

export default SideNav;