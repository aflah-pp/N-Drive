import { createContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../service/api'
import { toast } from 'react-toastify'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [username, setUsername] = useState('')
  const [storage, setStorage] = useState({})
  const [token, setToken] = useState(null)
  const [permission, setPermission] = useState([])
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])

  //Auth check
  const handleAuth = () => {
    const accessToken = localStorage.getItem('access')
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken)
        const expiry = decoded.exp
        const time_now = Date.now() / 1000
        if (expiry > time_now) {
          setIsAuthorized(true)
          setToken(accessToken)
        } else {
          setIsAuthorized(false)
          setToken(null)
        }
      } catch {
        setIsAuthorized(false)
        setToken(null)
      }
    } else {
      setIsAuthorized(false)
      setToken(null)
    }
  }

  //  Fetch username
  const getUserInfo = async () => {
    try {
      const res = await api.get('v1/username/')
      setUsername(res.data.username)
    } catch {
      setUsername('')
    }
  }

  //  Fetch total storage usage
  const getStorageUsed = async () => {
    try {
      const res = await api.get('v1/storage/usage/')
      setStorage(res.data)
    } catch (error) {
      toast.error('Failed to fetch storage usage')
      console.error(error)
    }
  }

  //  Fetch all root-level files and folders
  const getStorage = async () => {
    try {
      const res = await api.get('v1/storage/')
      setFolders(res.data.folders)
      setFiles(res.data.files)
    } catch (error) {
      toast.error('Failed to load files/folders.')
      console.error(error)
    }
  }

  //  Create folder
  const createFolder = async name => {
    try {
      await api.post('v1/create/folder/', { name })
      toast.success('📁 Folder created successfully!')
      await getStorage()
      await getStorageUsed()
    } catch (error) {
      const msg = error?.response?.data?.error || 'Failed to create folder'
      toast.error(msg)
    }
  }

  //  Upload file (root or folder)
  const uploadFile = async (file, folderId = null, onProgress = null) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (folderId) formData.append('folder_id', folderId)

      await api.post('v1/file/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            onProgress(progressEvent) // pass event to UI handler
          }
        },
      })

      toast.success(' File uploaded successfully!')
      await getStorage()
      await getStorageUsed()
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Upload failed'
      toast.error(`⚠️ ${msg}`)
      throw error // rethrow so frontend can handle if needed
    }
  }

  //  Delete file/folder
  const deleteItem = async (item, type) => {
    try {
      const payload =
        type === 'folder' ? { folder_id: item.id } : { file_id: item.id }
      await api.delete('v1/storage/delete/', { data: payload })
      toast.success('🗑️ Item deleted successfully!')
      await getStorage()
      await getStorageUsed()
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to delete item'
      toast.error(msg)
    }
  }

  //  Permissions
  const getPermission = async () => {
    try {
      const res = await api.get('v1/permissions')
      setPermission(res.data)
    } catch (error) {
      toast.error('Failed to load permissions')
    }
  }

  useEffect(() => {
    handleAuth()
  }, [])

  useEffect(() => {
    if (isAuthorized) {
      getUserInfo()
      getPermission()
      getStorageUsed()
      getStorage()
    }
  }, [isAuthorized])

  const AuthValue = {
    isAuthorized,
    setIsAuthorized,
    username,
    token,
    storage,
    folders,
    files,
    getStorage,
    getStorageUsed,
    createFolder,
    uploadFile,
    permission,
    deleteItem,
  }

  return (
    <AuthContext.Provider value={AuthValue}>{children}</AuthContext.Provider>
  )
}
