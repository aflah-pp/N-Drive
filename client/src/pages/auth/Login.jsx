import { useContext, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../service/api'
import { AuthContext } from '../../context/AuthContext'

function Login() {
  const { getUsername, setIsAuthorized } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/token/', { username, password })
      const { access, refresh } = res.data
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
      setIsAuthorized(true)
      getUsername
      setUsername('')
      setPassword('')
      const from = location?.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Login failed'
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dbc2a6] px-4">
      <div className="max-w-md w-full bg-[#fff9f3] p-8 rounded-2xl shadow-lg border border-[#99744a]/20">
        <h2 className="text-3xl font-bold text-center text-[#414a37] mb-6">
          Login
        </h2>
        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[#414a37] mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-[#99744a]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99744a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#414a37] mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#99744a]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99744a]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#99744a] text-white font-semibold py-2 rounded-xl hover:bg-[#7d5c3b] transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-[#414a37]">
          Don’t have an account?{' '}
          <Link to="/register">
            <span className="text-[#99744a] hover:underline cursor-pointer">
              Register here
            </span>
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
