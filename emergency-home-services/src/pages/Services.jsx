import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  const serviceList = [
    { title: "Plumbing Services", icon: "🚰", desc: "Leak repairs, pipe fittings, drain cleaning, and tap replacements." },
    { title: "Electrical Services", icon: "⚡", desc: "Short circuit repair, wiring, switchboards, and generator setups." },
    { title: "AC Repair & Maintenance", icon: "❄️", desc: "Filter cleaning, gas filling, cooling issue repair, and installation." },
    { title: "Appliance Repair", icon: "🛠️", desc: "Washing machine, refrigerator, microwave, and water heater repair." },
    { title: "Carpentry Services", icon: "🪚", desc: "Door lock installation, furniture repair, and custom woodwork." },
    { title: "Home Painting", icon: "🎨", desc: "Interior and exterior wall painting and waterproofing services." }
  ];

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#0f172a', fontSize: '2rem', marginBottom: '0.5rem' }}>Our Services</h2>
      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2.5rem' }}>Professional & affordable home maintenance services</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {serviceList.map((item, index) => (
          <div key={index} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>{item.icon}</span>
            <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>{item.title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.2rem', lineHeight: '1.5' }}>{item.desc}</p>
            <Link to="/book" style={{ color: '#dc2626', fontWeight: 'bold', textDecoration: 'none' }}>Book Now →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
