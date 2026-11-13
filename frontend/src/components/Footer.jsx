import React from 'react'

export default function Footer() {
  return (
    <footer style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e0e0e0', marginTop: '3rem', textAlign: 'center', color: '#777', fontSize: '0.9rem' }}>
      <p>&copy; {new Date().getFullYear()} Café Fausse. All rights reserved.</p>
    </footer>
  )
}

