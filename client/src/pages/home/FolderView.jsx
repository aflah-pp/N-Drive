import React, { useState, useEffect, useContext, useRef } from 'react'
import {
  FaTimes,
  FaPlus,
  FaFileAlt,
  FaEllipsisV,
  FaTrash,
  FaLink,
  FaDownload,
} from 'react-icons/fa'
import { AuthContext } from '../../context/AuthContext'

function FolderView({ folder, onClose, uploadFile }) {
  const [uploading, setUploading] = useState(false)
  const { deleteItem } = useContext(AuthContext)
  const [menuOpen, setMenuOpen] = useState(null)
  const menuRef = useRef(null)

  //  Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    await uploadFile(file, folder.id)
    setUploading(false)
    onClose()
  }

  const handleDelete = async file => {
    if (window.confirm(`Delete "${file.filename}"?`)) {
      await deleteItem(file, 'file')
      onClose()
    }
  }

  const handleOpenFile = async file => {
    try {
      if (file.unique_link_url) {
        window.open(file.file_url, '_blank')
      }
    } catch (err) {
      alert('⚠️ Failed to open file.')
    }
  }

  const handleDownload = file => {
    if (file.unique_link_url) {
      window.open(file.unique_link_url, '_blank')
    } else {
      alert('⚠️ No download link available.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#fff9f3] rounded-2xl w-full max-w-4xl shadow-2xl p-10 relative border border-[#99744a]/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#414a37] hover:text-[#99744a]"
        >
          <FaTimes size={20} />
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-[#dbc2a6] pb-3">
          <h2 className="text-2xl font-bold text-[#414a37]">
            📁 {folder.name}
          </h2>
          <label className="flex items-center gap-2 bg-[#99744a] text-white px-4 py-2 rounded-lg hover:bg-[#82603c] cursor-pointer">
            <FaPlus /> {uploading ? 'Uploading...' : 'Upload File'}
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        {/* File Grid */}
        {folder.files?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {folder.files.map(file => (
              <div
                key={file.id}
                className="relative flex flex-col items-center p-4 bg-[#dbc2a6]/20 border border-[#99744a]/30 rounded-xl hover:bg-[#dbc2a6]/40 transition"
              >
                <FaFileAlt className="text-[#414a37] w-10 h-10 mb-2" />
                <span className="text-sm font-medium text-[#414a37] text-center truncate w-full">
                  {file.filename}
                </span>

                {/* 3-dot menu button */}
                <button
                  className="absolute top-2 right-2 cursor-pointer text-[#414a37] hover:text-[#99744a]"
                  onClick={e => {
                    e.stopPropagation()
                    setMenuOpen(menuOpen === file.id ? null : file.id)
                  }}
                >
                  <FaEllipsisV size={14} />
                </button>

                {/* Dropdown menu */}
                {menuOpen === file.id && (
                  <div
                    ref={menuRef}
                    className="absolute top-8 right-2 bg-white shadow-lg border border-[#dbc2a6] rounded-lg z-50 w-36 text-sm"
                  >
                    <button
                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-[#dbc2a6]/40 text-left"
                      onClick={() => {
                        handleDelete(file)
                        setMenuOpen(null)
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-[#dbc2a6]/40 text-left"
                      onClick={() => {
                        handleOpenFile(file)
                        setMenuOpen(null)
                      }}
                    >
                      <FaLink /> Open File
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-[#dbc2a6]/40 text-left"
                      onClick={() => {
                        handleDownload(file)
                        setMenuOpen(null)
                      }}
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#5a4e3d] text-center mt-6">
            No files in this folder
          </p>
        )}
      </div>
    </div>
  )
}

export default FolderView
