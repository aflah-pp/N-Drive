import React from 'react'
import BillingPage from './BillingPage'
import Sidebar from '../../components/SideBar'

function BillingPageLayout() {
  return (
    <div className="flex min-h-screen  overflow-hidden bg-[#dbc2a6]">
      <Sidebar />

      <main className="flex-1 p-8 md:ml-64 ">
        <BillingPage />
      </main>
    </div>
  )
}

export default BillingPageLayout
