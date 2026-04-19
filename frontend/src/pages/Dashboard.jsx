import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiUrl } from "../lib/api";

export default function Dashboard() {
  const [usage, setUsage] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState(null);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const tenantId = localStorage.getItem("tenantId");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchData = async () => {
    try {
      const usageRes = await axios.get(apiUrl("/api/usage/current"), config);
      setUsage(usageRes.data.data || usageRes.data);

      const billRes = await axios.get(apiUrl("/api/billing/current"), config);
      setBill(billRes.data.data);
    } catch (err) {
      console.log("Error:", err);
      setBill({
        storageCost: 0,
        apiCallsCost: 0,
        bandwidthCost: 0,
        totalCost: 0,
      });
    }

    try {
      const forecastRes = await axios.get(apiUrl("/api/billing/forecast"), config);
      setForecast(forecastRes.data.predictions);
    } catch (err) {
      console.log("Forecast error:", err);
    }

    setLoading(false);
  };

  const fetchFiles = async () => {
    const res = await fetch(apiUrl("/api/objects"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setFiles(data);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch(apiUrl("/api/objects/upload"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    await fetchFiles();
    await fetchData();
  };

  const handleDelete = async (file) => {
    await fetch(apiUrl(`/api/objects/${file}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchFiles();
    await fetchData();
  };

  const handleSync = async () => {
    try {
      await axios.post(apiUrl("/api/usage/sync"), {}, config);
      await fetchData();
      alert("Data synced!");
    } catch (err) {
      alert("Sync failed!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleDownload = async (filename) => {
    try {
      const res = await fetch(apiUrl(`/api/objects/presigned/${filename}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      window.open(data.url, "_blank");
      await fetchData();
    } catch (err) {
      console.log("Download error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
      await fetchFiles();
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const usageChartData = [
    { name: "Storage (GB)", value: usage?.storageGB || 0 },
    { name: "API Calls (k)", value: (usage?.apiCalls || 0) / 1000 },
    { name: "Bandwidth (GB)", value: usage?.bandwidthGB || 0 },
  ];
  const billChartData = [
    { name: "Storage", value: bill?.storageCost || 0 },
    { name: "API Calls", value: bill?.apiCallsCost || 0 },
    { name: "Bandwidth", value: bill?.bandwidthCost || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Billing Engine</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {name} ({tenantId})
          </span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
          >
            Logout
          </button>
          <button
            onClick={handleSync}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mr-2"
          >
            Sync
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500 text-sm">Storage Used</p>
            <p className="text-2xl font-bold text-blue-600">
              {((usage?.storageGB || 0) * 1024).toFixed(2)} MB
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
              {(usage?.bandwidthGB || 0).toFixed(6)} GB
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-500 text-sm">Total Bill</p>
            <p className="text-2xl font-bold text-red-600">
              ${(bill?.totalCost || 0).toFixed(6)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">Usage Overview</h2>
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
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">Cost Breakdown</h2>
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

        <div className="bg-white rounded-lg p-6 shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">Bill Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Storage Cost</span>
              <span className="font-medium">
                ${(bill?.storageCost || 0).toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">API Calls Cost</span>
              <span className="font-medium">
                ${(bill?.apiCallsCost || 0).toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Bandwidth Cost</span>
              <span className="font-medium">
                ${(bill?.bandwidthCost || 0).toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-red-600">
                ${(bill?.totalCost || 0).toFixed(6)} USD
              </span>
            </div>
          </div>
        </div>

        {forecast && (
          <div className="bg-white rounded-lg p-6 shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">Next Month Prediction (ML)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded p-3 text-center">
                <p>Storage</p>
                <p className="text-2xl font-bold text-blue-600">
                  {((usage?.storageGB || 0) * 1024).toFixed(6)} MB
                </p>
              </div>
              <div className="bg-green-50 rounded p-3 text-center">
                <p>API Calls</p>
                <p>{Math.round(forecast.apiCalls)}</p>
              </div>
              <div className="bg-purple-50 rounded p-3 text-center">
                <p>Bandwidth</p>
                <p>{forecast.bandwidthGB.toFixed(6)} GB</p>
              </div>
              <div className="bg-red-50 rounded p-3 text-center">
                <p>Est. Cost</p>
                <p>${forecast.estimatedCost.toFixed(6)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-6 shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">Object Storage</h2>
          <div className="mb-4">
            <input
              type="file"
              onChange={handleUpload}
              className="border p-2 rounded"
            />
          </div>
          {files.length === 0 ? (
            <p className="text-gray-500">No files uploaded</p>
          ) : (
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file}
                  className="flex justify-between items-center border p-3 rounded"
                >
                  <span>{file}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
