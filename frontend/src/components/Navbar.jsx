import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const getLinkStyle = ({ isActive }) => ({
    marginRight: '1.25rem',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: 'none',
    color: isActive ? '#000' : '#555',
  })

  return (
    <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
      <span style={{ marginRight: '2.5rem', fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
        Café Fausse
      </span>
      <div>
        <NavLink to="/" style={getLinkStyle}>Home</NavLink>
        <NavLink to="/menu" style={getLinkStyle}>Menu</NavLink>
        <NavLink to="/reservations" style={getLinkStyle}>Reservations</NavLink>
        <NavLink to="/about" style={getLinkStyle}>About</NavLink>
        <NavLink to="/gallery" style={getLinkStyle}>Gallery</NavLink>
      </div>
    </nav>
  )
}

