import React, { useState, useEffect } from 'react'

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
  })

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setHealthStatus({
          loading: false,
          connected: true,
          data,
          error: null,
        })
      })
      .catch((err) => {
        setHealthStatus({
          loading: false,
          connected: false,
          data: null,
          error: err.message,
        })
      })
  }, [])

  return (
    <div>
      <h1>Welcome to Café Fausse</h1>
      <p>An extraordinary fine dining experience.</p>

      {/* Temporary Phase 1 Backend Connection Check */}
      <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '6px', background: '#fafafa' }}>
        <h3 style={{ marginTop: 0 }}>Backend Connectivity Check (Phase 1)</h3>
        {healthStatus.loading && <p>Checking connection to Flask backend at <code>/api/health</code>...</p>}
        {!healthStatus.loading && healthStatus.connected && (
          <p style={{ color: '#2e7d32', fontWeight: 500 }}>
            Connected to Flask backend! Response: <code>{JSON.stringify(healthStatus.data)}</code>
          </p>
        )}
        {!healthStatus.loading && !healthStatus.connected && (
          <p style={{ color: '#c62828', fontWeight: 500 }}>
            Unable to connect to Flask backend: <code>{healthStatus.error}</code>
          </p>
        )}
      </section>
    </div>
  )
}

