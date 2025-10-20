import React, { useContext, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
  FaFolder,
  FaRobot,
  FaImage,
  FaBars,
  FaTimes,
  FaSpinner,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUserCircle,
  FaRupeeSign,
} from 'react-icons/fa'
import { CgFileDocument } from 'react-icons/cg'
import NavLink from './NavLink'

function Sidebar() {
  const { isAuthorized, setIsAuthorized, username, storage, permission } =
    useContext(AuthContext)
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: 'My Drive', path: '/', icon: <FaFolder /> },
    {
      name: 'Chat AI',
      path: '/chat',
      icon: <FaRobot />,
      enabled: permission?.chat ?? false,
    },
    {
      name: 'Image Gen',
      path: '/img-gen',
      icon: <FaImage />,
      enabled: permission?.image ?? false,
    },
    { name: 'Pricing', path: '/pricing', icon: <FaRupeeSign /> },
    { name: 'Doc', path: '/doc', icon: <CgFileDocument /> },
  ]

  const handleNavClick = path => {
    setLoading(true)
    setTimeout(() => setLoading(false), 300)
    setIsOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setIsAuthorized(false)
    setIsOpen(false)
    window.location.reload()
  }

  return (
    <>
      {/* Top bar for mobile */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#dbc2a6] h-16 flex items-center justify-between px-4 shadow-md z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#414a37] hover:text-[#99744a] text-2xl"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h2 className="text-xl font-bold text-[#414a37] m-auto">N-Drive</h2>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 md:top-0 left-0 bg-[#dbc2a6] w-64 h-full md:h-[100vh] shadow-lg p-6 flex flex-col gap-8 transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <h2 className="hidden md:block text-2xl font-bold text-[#414a37]">
          N-Drive
        </h2>

        {/* Storage */}
        <div className="flex flex-col gap-2 mt-4 md:mt-0">
          <span className="text-[#414a37] font-medium tracking-wide">
            Storage
          </span>
          <div className="w-full bg-[#99744a]/30 rounded-full h-4 overflow-hidden">
            <div
              className="bg-[#99744a] h-4 transition-all duration-500"
              style={{ width: `${storage.used_percentage || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-[#414a37] mt-1">
            <span>Used: {storage.used_storage}</span>
            <span>Remain: {storage.remaining_storage}</span>
          </div>
          <div className="text-sm text-[#414a37] mt-1">
            Total: {storage.total_storage} ({storage.used_percentage || 0}%)
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 mt-6">
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            const isDisabled = item.enabled === false

            return isDisabled ? (
              <div
                key={item.name}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[#a09f9d] cursor-not-allowed relative"
                title="Your package does not include this feature"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>

                {/* Custom Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[#414a37] text-white text-[10px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-md translate-x-1 group-hover:translate-x-0">
                  Not in your package
                </div>
              </div>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition
        ${
          isActive
            ? 'bg-[#99744a]/20 text-[#414a37]'
            : 'text-[#414a37] hover:bg-[#99744a]/20 hover:text-[#99744a]'
        }`}
              >
                <span
                  className={`text-lg transition-transform duration-300 ${
                    isActive ? 'text-[#99744a] scale-110' : 'text-[#414a37]'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {loading && isActive && (
                  <FaSpinner className="animate-spin ml-auto text-[#99744a]" />
                )}
              </Link>
            )
          })}

          {/* Profile + Logout */}
          {isAuthorized && (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center mt-20 gap-2 px-3 py-2 rounded-lg bg-[#99744a]/20 border border-[#99744a]/40 shadow-sm"
              >
                <FaUserCircle className="w-5 h-5 text-[#99744a]" />
                <span className="text-sm font-semibold text-[#414a37]">
                  {username}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 transition"
              >
                <FaSignOutAlt className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          )}

          {/* Auth buttons */}
          {!isAuthorized && (
            <>
              <NavLink
                to="/login"
                label="Login"
                icon={FaSignInAlt}
                color="#99744a"
              />
              <NavLink
                to="/register"
                label="Register"
                icon={FaUserPlus}
                color="#99744a"
              />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="mt-auto text-xs text-[#414a37]/70">
          &copy; {new Date().getFullYear()} N-Drive. All rights reserved.
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        ></div>
      )}
    </>
  )
}

export default Sidebar
