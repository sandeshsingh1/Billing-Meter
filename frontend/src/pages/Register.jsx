// ─────────────────────────────────────
// Register Page
// ─────────────────────────────────────
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
export default function Register() {
  const [form,    setForm]    = useState({
    name: '', email: '', password: '', tenantId: ''
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  // Input change handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form)
      localStorage.setItem('token',    res.data.token)
      localStorage.setItem('tenantId', res.data.tenantId)
      localStorage.setItem('name',     res.data.name)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          🚀 Billing Engine
        </h1>
        <p className="text-center text-gray-500 mb-6">Create your account</p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Sandesh Singh"
              required
            />
          </div>
          {/* TenantId */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Tenant ID</label>
            <input
              name="tenantId"
              value={form.tenantId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="t001"
              required
            />
          </div>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="sandesh@test.com"
              required
            />
          </div>
          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Already account hai?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login karo
          </Link>
        </p>
      </div>
    </div>
  )
}