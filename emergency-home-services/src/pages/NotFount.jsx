import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '3rem', color: '#dc2626' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: '#64748b', margin: '1rem 0 2rem' }}>
        നിങ്ങൾ തിരയുന്ന പേജ് നിലവിലില്ല.
      </p>
      <Link 
        to="/" 
        style={{ 
          backgroundColor: '#0f172a', 
          color: '#fff', 
          padding: '0.8rem 1.5rem', 
          borderRadius: '8px', 
          textDecoration: 'none',
          fontWeight: 'bold'
        }}
      >
        Go Back Home
      </Link>
    </div>
  );
}