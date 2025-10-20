import React, { useEffect, useState } from 'react'
import { FaRegUserCircle, FaEdit } from 'react-icons/fa'
import api from '../../service/api'
import UserUpdateModal from './UserUpdateModal'

function UserInfo() {
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api
      .get('v1/self/')
      .then(res => setUser(res.data))
      .catch(err => console.error('Error fetching user info:', err))
  }, [])

  if (!user)
    return (
      <div className="bg-[#bca284]/40 p-8 rounded-xl shadow text-center text-[#414a37] font-medium">
        Loading user info...
      </div>
    )

  const userData = user.user

  return (
    <div className="bg-[#bca284]/50 rounded-xl p-8 shadow-md border border-[#a88a68]/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#a88a68]/50 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <FaRegUserCircle className="w-14 h-14 text-[#99744a]" />
          <div>
            <h2 className="text-2xl font-semibold tracking-wide">
              {userData.name || userData.username}
            </h2>
            <p className="text-sm bg-[#99744a]/30 inline-block px-2 py-0.5 rounded mt-1 font-medium">
              {userData.package_name || 'Free'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#99744a]/30 hover:bg-[#99744a]/50 transition font-semibold text-[#414a37]"
        >
          <FaEdit />
          Edit
        </button>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InfoItem label="Username" value={userData.username} />
        <InfoItem label="Email" value={userData.email} />
        <InfoItem label="Full Name" value={userData.name} />
        <InfoItem label="Phone" value={userData.phone || '—'} />
      </div>

      {/* Package Details */}
      <div className="mt-8 bg-[#99744a]/20 rounded-lg p-5 border border-[#a88a68]/50">
        <h3 className="text-lg font-bold mb-4 tracking-wide text-[#414a37]">
          Package Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem
            label="Package Name"
            value={userData.package_name || 'Free'}
          />
          <InfoItem
            label="Max Upload Size"
            value={`${(userData.max_storage || 104857600) / 1024 / 1024} MB`}
          />
          <InfoItem
            label="Chat AI"
            value={userData.chat === 'True' ? 'Enabled' : 'Disabled'}
          />
          <InfoItem
            label="Image Generation"
            value={userData.img_gen === 'True' ? 'Enabled' : 'Disabled'}
          />
        </div>
      </div>

      {showModal && (
        <UserUpdateModal user={userData} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="p-4 bg-[#dbc2a6]/50 rounded-lg border border-[#a88a68]/50 shadow-sm hover:shadow-md transition-all duration-200">
      <p className="text-sm font-semibold text-[#99744a]">{label}</p>
      <p className="text-[#414a37] font-bold mt-1">{value || '—'}</p>
    </div>
  )
}

export default UserInfo
