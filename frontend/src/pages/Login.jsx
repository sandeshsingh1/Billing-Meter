// ─────────────────────────────────────
// Login Page
// ─────────────────────────────────────
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
export default function Login() {
  // Form state
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()
  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      })
      // Token aur user data localStorage mein save karo
      localStorage.setItem('token',    res.data.token)
      localStorage.setItem('tenantId', res.data.tenantId)
      localStorage.setItem('name',     res.data.name)
      // Dashboard pe redirect karo
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  } 
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          🚀 Billing Engine
        </h1>
        <p className="text-center text-gray-500 mb-6">Login to your account</p>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="sandesh@test.com"
              required
            />
          </div>
          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="••••••"
              required
            />
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Account nahi hai?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register karo
          </Link>
        </p>
      </div>
    </div>
  )
}
