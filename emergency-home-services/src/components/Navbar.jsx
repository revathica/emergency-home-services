import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <NavLink to="/">🚨 Emergency Home</NavLink>
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
        </li>
        <li>
          <NavLink to="/services" className={({ isActive }) => (isActive ? 'active' : '')}>Services</NavLink>
        </li>
        <li>
          <NavLink to="/emergency" className={({ isActive }) => (isActive ? 'active' : '')}>Emergency Help</NavLink>
        </li>
        <li>
          <NavLink to="/book" className={({ isActive }) => (isActive ? 'active' : '')}>Book Service</NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>About Us</NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>Contact</NavLink>
        </li>
        <li>
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>Login</NavLink>
        </li>
      </ul>
      <a href="tel:+919876543210" className="nav-call-btn">📞 Call Now</a>
    </nav>
  );
}