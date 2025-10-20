import React from 'react'
import ChatUI from '../../components/ChatUI'
import Sidebar from '../../components/SideBar'

function ChatAI() {
  return (
    <div className="flex bg-[#dbc2a6] min-h-screen text-[#414a37]">
      <Sidebar />

      <main className=" flex-1 h-screen overflow-hidden transition-all duration-300 md:ml-64 ml-0">
        <ChatUI />
      </main>
    </div>
  )
}

export default ChatAI
