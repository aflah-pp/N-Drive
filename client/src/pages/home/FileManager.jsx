import React, { useState, useContext, useEffect, useRef } from 'react'
import { FaFolder, FaFileAlt, FaEllipsisV, FaPlus } from 'react-icons/fa'
import Sidebar from '../../components/SideBar'
import FolderView from './FolderView'
import { AuthContext } from '../../context/AuthContext'
import UploadProgress from '../../components/UploadProgress'

function FileManager() {
  const { folders, files, createFolder, uploadFile, deleteItem } =
    useContext(AuthContext)

  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploadedMB, setUploadedMB] = useState(0)
  const [totalMB, setTotalMB] = useState(0)
  const [uploading, setUploading] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  //  Create folder
  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:')
    if (!name) return
    await createFolder(name)
  }

  // ⬆ Upload file
  const handleUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    const totalMB = file.size / (1024 * 1024)
    setUploading(true)
    setProgress(0)
    setUploadedMB(0)
    setTotalMB(totalMB)

    try {
      await uploadFile(file, null, e => {
        if (e.total) {
          const percent = Math.round((e.loaded * 100) / e.total)
          setProgress(percent)
          setUploadedMB(e.loaded / (1024 * 1024))
        }
      })
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  //  Confirm delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteItem(deleteTarget, deleteTarget.type)
    setShowDeleteModal(false)
  }

  //  File/Folders click handlers
  const handleOpen = (item, type) => {
    if (type === 'folder') {
      setSelectedFolder(item)
    } else if (type === 'file') {
      if (item.file_url) window.open(item.file_url, '_blank')
      else alert('⚠️ File URL not found.')
    }
  }

  const handleDownload = item => {
    if (item.unique_link_url) window.open(item.unique_link_url, '_blank')
    else alert('⚠️ Download link not available.')
  }

  const handleCopyLink = async item => {
    try {
      await navigator.clipboard.writeText(item.unique_link_url)
      alert('✅ Link copied to clipboard!')
    } catch {
      alert('⚠️ Failed to copy link.')
    }
  }

  const renderItem = (item, type) => (
    <div
      key={item.id}
      onClick={() => handleOpen(item, type)}
      className="relative flex flex-col items-center p-4 bg-[#fff9f3] border border-[#99744a]/30 rounded-xl cursor-pointer hover:bg-[#dbc2a6]/30 transition"
    >
      {type === 'folder' ? (
        <FaFolder className="text-[#99744a] w-10 h-10 mb-2" />
      ) : (
        <FaFileAlt className="text-[#414a37] w-10 h-10 mb-2" />
      )}
      <span className="text-sm font-medium text-[#414a37] text-center truncate w-full">
        {item.name || item.filename}
      </span>

      <div
        className="absolute top-2 right-2"
        onClick={e => e.stopPropagation()} // prevent file/folder open on menu click
      >
        <button
          onClick={() =>
            setDropdownOpen(dropdownOpen === item.id ? null : item.id)
          }
          className="text-[#414a37] hover:text-[#99744a]"
        >
          <FaEllipsisV />
        </button>

        {dropdownOpen === item.id && (
          <div
            ref={menuRef}
            className="absolute top-7 right-0 bg-white border border-[#dbc2a6] rounded-lg shadow-md w-40 z-50 text-sm"
          >
            {/* Delete */}
            <button
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#dbc2a6]/40 w-full text-left"
              onClick={() => {
                setDeleteTarget({ ...item, type })
                setShowDeleteModal(true)
                setDropdownOpen(null)
              }}
            >
              🗑 Delete
            </button>

            {/* Copy Link */}
            <button
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#dbc2a6]/40 w-full text-left"
              onClick={() => {
                handleCopyLink(item)
                setDropdownOpen(null)
              }}
            >
              🔗 Copy Link
            </button>

            {/* Download */}
            <button
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#dbc2a6]/40 w-full text-left"
              onClick={() => {
                handleDownload(item)
                setDropdownOpen(null)
              }}
            >
              ⬇️ Download
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#dbc2a6]/20">
      {/* Sidebar */}
      <div className="fixed md:static z-40 transform transition-transform duration-300 top-16 left-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 mt-20 md:ml-64">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-[#414a37]">My Drive</h1>
          <div className="flex gap-4">
            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-2 bg-[#99744a] text-white px-4 py-2 rounded-lg hover:bg-[#82603c]"
            >
              <FaFolder /> New Folder
            </button>
            <label className="flex items-center gap-2 bg-[#414a37] text-white px-4 py-2 rounded-lg hover:bg-[#5a4e3d] cursor-pointer">
              <FaPlus /> {uploading ? 'Uploading...' : 'Upload File'}
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>

        {/* Folders */}
        <section>
          <h2 className="text-xl font-semibold text-[#414a37] mb-3">Folders</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folders.map(f => renderItem(f, 'folder'))}
          </div>
        </section>

        {/* Files */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#414a37] mb-3">Files</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map(f => renderItem(f, 'file'))}
          </div>
        </section>

        {/* Folder Modal */}
        {selectedFolder && (
          <FolderView
            folder={selectedFolder}
            onClose={() => setSelectedFolder(null)}
            uploadFile={uploadFile}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-80">
              <h3 className="text-lg font-bold mb-4 text-[#414a37]">
                Confirm Delete
              </h3>
              <p className="mb-4 text-[#5a4e3d]">
                Are you sure you want to delete this <b>{deleteTarget?.type}</b>
                ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {uploading && (
        <UploadProgress
          progress={progress}
          uploadedMB={uploadedMB}
          totalMB={totalMB}
        />
      )}
    </div>
  )
}

export default FileManager
