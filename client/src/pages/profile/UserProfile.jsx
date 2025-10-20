import React from 'react'
import UserInfo from './UserInfo'
import Sidebar from '../../components/SideBar'

function UserProfile() {
  return (
    <div className="flex bg-[#f3e9da] min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-6 space-y-8 text-[#414a37] transition-all duration-300">
        <h1 className="text-3xl font-bold border-b-1 border-[#99744a] pb-1">
          My Profile
        </h1>
        <UserInfo />
      </main>
    </div>
  )
}

export default UserProfile
