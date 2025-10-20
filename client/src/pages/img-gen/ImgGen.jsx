import React from 'react'
import ImgGenUI from '../../components/ImgGenUI'
import Sidebar from '../../components/SideBar'

function ImgGen() {
  return (
    <div className="flex bg-[#dbc2a6] min-h-screen text-[#414a37]">
      <Sidebar />

      <main className=" flex-1 h-screen overflow-hidden transition-all duration-300 md:ml-64 ml-0">
        <ImgGenUI />
      </main>
    </div>
  )
}

export default ImgGen
