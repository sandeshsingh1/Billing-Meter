// ─────────────────────────────────────
// Dashboard Page
// Usage charts aur bill dikhata hai
// ─────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
export default function Dashboard(){
  const [usage,   setUsage]   = useState(null)
  const [bill,    setBill]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [forecast, setForecast] = useState(null)
  const navigate  = useNavigate()
  const token     = localStorage.getItem('token')
  const name      = localStorage.getItem('name')
  const tenantId  = localStorage.getItem('tenantId')

  // Auth header
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  // Data fetch karo
  useEffect(() => {
    fetchData()
  }, [])

const fetchData = async () => {
    try {
        // Current usage lo
        const usageRes = await axios.get(
            'http://localhost:5000/api/usage/current', config
        )
        setUsage(usageRes.data.data || usageRes.data)

        // Current bill lo
        const billRes = await axios.get(
            'http://localhost:5000/api/billing/current', config
        )
        setBill(billRes.data.data)

    } catch (err) {
        console.log('Error:', err)
    }

    // Forecast alag try-catch mein — 
    // taki baaki data show ho chahe forecast fail ho
    try {
        const forecastRes = await axios.get(
            'http://localhost:5000/api/billing/forecast', config
        )
        setForecast(forecastRes.data.predictions)
    } catch (err) {
        console.log('Forecast error:', err)
    }

    setLoading(false)
}

  // Logout
  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Chart data
  const usageChartData = [
    { name: 'Storage (GB)', value: usage?.storageGB   || 0 },
    { name: 'API Calls (k)', value: (usage?.apiCalls  || 0) / 1000 },
    { name: 'Bandwidth (GB)', value: usage?.bandwidthGB || 0 },
  ]
  const billChartData = [
    { name: 'Storage',   value: bill?.storageCost   || 0 },
    { name: 'API Calls', value: bill?.apiCallsCost  || 0 },
    { name: 'Bandwidth', value: bill?.bandwidthCost || 0 },
  ]
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🚀 Billing Engine</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">👤 {name} ({tenantId})</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500 text-sm">Storage Used</p>
            <p className="text-2xl font-bold text-blue-600">
              {usage?.storageGB || 0} GB
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500 text-sm">API Calls</p>
            <p className="text-2xl font-bold text-green-600">
              {(usage?.apiCalls || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500 text-sm">Bandwidth</p>
            <p className="text-2xl font-bold text-purple-600">
              {usage?.bandwidthGB || 0} GB
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500 text-sm">Total Bill</p>
            <p className="text-2xl font-bold text-red-600">
              ${bill?.totalCost || 0}
            </p>
          </div>
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usage Chart */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">📊 Usage Overview</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={usageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Bill Chart */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">💰 Cost Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={billChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="value" fill="#10B981" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Bill Summary */}
        <div className="bg-white rounded-lg p-6 shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">🧾 Bill Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Storage Cost</span>
              <span className="font-medium">${bill?.storageCost || 0}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">API Calls Cost</span>
              <span className="font-medium">${bill?.apiCallsCost || 0}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Bandwidth Cost</span>
              <span className="font-medium">${bill?.bandwidthCost || 0}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-red-600">
                ${bill?.totalCost || 0} USD
              </span>
            </div>
          </div>
        </div>
        {/* ML Forecast */}
{forecast && (
    <div className="bg-white rounded-lg p-6 shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">
            🤖 Next Month Prediction (ML)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-blue-50 rounded p-3 text-center">
                <p className="text-gray-500 text-sm">Storage</p>
                <p className="text-xl font-bold text-blue-600">
                    {forecast.storageGB} GB
                </p>
            </div>

            <div className="bg-green-50 rounded p-3 text-center">
                <p className="text-gray-500 text-sm">API Calls</p>
                <p className="text-xl font-bold text-green-600">
                    {forecast.apiCalls?.toLocaleString()}
                </p>
            </div>

            <div className="bg-purple-50 rounded p-3 text-center">
                <p className="text-gray-500 text-sm">Bandwidth</p>
                <p className="text-xl font-bold text-purple-600">
                    {forecast.bandwidthGB} GB
                </p>
            </div>

            <div className="bg-red-50 rounded p-3 text-center">
                <p className="text-gray-500 text-sm">Est. Cost</p>
                <p className="text-xl font-bold text-red-600">
                    ${forecast.estimatedCost}
                </p>
            </div>
        </div>
    </div>
)}
      </div>
    </div>
  )
}
