import React, { useState } from 'react'
import api from '../../service/api'

function UserUpdateModal({ user, onClose }) {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    name: user.name || '',
    phone: user.phone || '',
  })

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    api
      .put('v1/update/', formData)
      .then(() => {
        alert('Profile updated successfully!')
        onClose()
      })
      .catch(err => console.error('Error updating profile:', err))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#bca284] border border-[#a88a68] rounded-2xl shadow-xl w-full max-w-md p-8 text-[#414a37]">
        <h2 className="text-2xl font-semibold mb-6 border-b border-[#a88a68]/60 pb-2">
          Update Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <InputField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-[#a88a68] hover:bg-[#99744a]/40 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#99744a] hover:bg-[#414a37] text-white font-semibold transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InputField({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-[#414a37]/80 mb-1 font-semibold">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="border border-[#a88a68]/60 rounded-lg px-3 py-2 bg-[#dbc2a6]/60 focus:ring-2 focus:ring-[#99744a]/50 focus:outline-none"
      />
    </div>
  )
}

export default UserUpdateModal
