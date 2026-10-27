import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2.5rem 1.5rem 1rem', marginTop: '3rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h3 style={{ color: '#fff', marginBottom: '0.8rem' }}>🚨 Emergency Home Services</h3>
          <p style={{ maxWidth: '300px', fontSize: '0.9rem' }}>Fast, reliable, and professional 24/7 home repair and maintenance services.</p>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '0.8rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
            <li><Link to="/services" style={{ color: '#94a3b8', textDecoration: 'none' }}>Services</Link></li>
            <li><Link to="/emergency" style={{ color: '#94a3b8', textDecoration: 'none' }}>Emergency Help</Link></li>
            <li><Link to="/book" style={{ color: '#94a3b8', textDecoration: 'none' }}>Book Service</Link></li>
            <li><Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '0.8rem' }}>Contact Info</h4>
          <p style={{ fontSize: '0.9rem' }}>📞 Phone: +91 98765 43210</p>
          <p style={{ fontSize: '0.9rem' }}>✉️ Email: support@emergencyhome.com</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid #1e293b', marginTop: '2rem', paddingTop: '1rem', fontSize: '0.85rem' }}>
        © 2026 Emergency Home Services. All rights reserved.
      </div>
    </footer>
  );
}