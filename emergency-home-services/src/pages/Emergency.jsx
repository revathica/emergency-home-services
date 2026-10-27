import React from 'react';

export default function Emergency() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ background: '#fef2f2', padding: '2rem', borderRadius: '16px', border: '2px solid #fecaca' }}>
        <h2 style={{ color: '#dc2626', fontSize: '2.2rem', marginBottom: '1rem' }}>🚨 24/7 Emergency Support</h2>
        <p style={{ color: '#7f1d1d', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          Got a water leak, electrical hazard, or AC breakdown? Our fast-response team is ready to reach your location within 30 minutes!
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', margin: '2rem 0' }}>
          <a href="tel:+919745400607" style={{ background: '#dc2626', color: '#fff', padding: '1rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
            📞 Call Emergency Hotline
          </a>
          <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', padding: '1rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'left' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Emergency Helpline Numbers:</h3>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.2', fontSize: '1.05rem', color: '#334155' }}>
          <li>⚡ <strong>Electrical Emergency:</strong> +91 98765 43211</li>
          <li>🚰 <strong>Plumbing Leakage:</strong> +91 98765 43212</li>
          <li>❄️ <strong>AC Breakdown:</strong> +91 98765 43213</li>
        </ul>
      </div>
    </div>
  );
}