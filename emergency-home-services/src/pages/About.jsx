import React from 'react';

export default function About() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto', color: '#334155', lineHeight: '1.7' }}>
      <h2 style={{ textAlign: 'center', color: '#0f172a', fontSize: '2.2rem', marginBottom: '1rem' }}>About Us</h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
        Your trusted partner for 24/7 emergency home repairs and maintenance.
      </p>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h3 style={{ color: '#dc2626', marginBottom: '0.8rem' }}>Who We Are</h3>
        <p>
          Emergency Home Services was founded with a mission to deliver fast, transparent, and expert home maintenance services when you need them the most. We specialize in instant repair solutions for households and commercial spaces.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '10px' }}>
          <h4>👨‍🔧 Certified Experts</h4>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>All our technicians are background-verified and experienced professionals.</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '10px' }}>
          <h4>⏱️ 30-Min Arrival</h4>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Fastest response time in town for critical electrical and plumbing emergencies.</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '10px' }}>
          <h4>💰 Fair Pricing</h4>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>No hidden charges. Transparent upfront quotes before starting any work.</p>
        </div>
      </div>
    </div>
  );
}