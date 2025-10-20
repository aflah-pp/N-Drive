import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../service/api'
import { AuthContext } from '../../context/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { setIsAuthorized } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    try {
      const dataToSend = { ...formData }
      delete dataToSend.confirmPassword
      setLoading(true)

      const res = await api.post('v1/register/', dataToSend)
      setLoading(false)
      localStorage.setItem('access', res.data.token.access)
      localStorage.setItem('refresh', res.data.token.refresh)
      setIsAuthorized(true)
      navigate('/home')
    } catch (err) {
      const detail = err.response?.data
      setLoading(false)
      if (detail && typeof detail === 'object') {
        const serverErrors = {}
        for (const key in detail) {
          serverErrors[key] = Array.isArray(detail[key])
            ? detail[key][0]
            : detail[key]
        }
        setErrors(serverErrors)
      } else {
        setGeneralError(detail?.detail || 'Registration failed')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dbc2a6] px-4">
      <div className="max-w-3xl w-full bg-[#fff9f3] p-8 rounded-2xl shadow-lg border border-[#99744a]/20">
        <h2 className="text-3xl font-bold text-center text-[#414a37] mb-6">
          Register
        </h2>
        {generalError && (
          <p className="text-red-600 text-sm mb-4 text-center">
            {generalError}
          </p>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {[
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'first_name', label: 'First Name', type: 'text' },
            { name: 'last_name', label: 'Last Name', type: 'text' },
            { name: 'phone', label: 'Phone', type: 'text' },
            { name: 'password', label: 'Password', type: 'password' },
            {
              name: 'confirmPassword',
              label: 'Confirm Password',
              type: 'password',
            },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-[#414a37] mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[#99744a]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99744a]"
              />
              {errors[field.name] && (
                <p className="text-red-600 text-xs mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#99744a] text-white font-semibold py-2 rounded-xl hover:bg-[#7d5c3b] transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>

          <p className="md:col-span-2 mt-4 text-sm text-center text-[#414a37]">
            Already have an account?{' '}
            <Link to="/login">
              <span className="text-[#99744a] hover:underline cursor-pointer">
                Login here
              </span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
