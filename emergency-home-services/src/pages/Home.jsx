import React from 'react';
import { Link } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import './Home.css';

export default function Home() {
  const services = [
    { id: 1, title: 'Plumbing Services', icon: '🚰', desc: 'Pipe leaks, blockages, tap replacements & rapid fixes.' },
    { id: 2, title: 'Electrical Repair', icon: '⚡', desc: 'Short circuits, wiring issues, switchboard repairs & installations.' },
    { id: 3, title: 'AC Services & Repair', icon: '❄️', desc: 'AC cooling issues, gas refilling, filter cleaning & maintenance.' },
    { id: 4, title: 'Appliance Repair', icon: '🔧', desc: 'Washing machines, refrigerators, microwave repair & setup.' },
    { id: 5,title: "Carpentry Services", icon: "🪚", desc: "Door lock installation, furniture repair, and custom woodwork." },
    { id: 6,title: "Home Painting", icon: "🎨", desc: "Interior and exterior wall painting and waterproofing services." }
  ];

  const features = [
    { title: '24/7 Rapid Response', desc: 'We arrive at your doorstep within 30 minutes of booking.', icon: '🚀' },
    { title: 'Verified Technicians', desc: 'Skilled, background-checked, and background-verified pros.', icon: '🛡️' },
    { title: 'Affordable Pricing', desc: 'No hidden charges. Clear and upfront cost estimates.', icon: '💎' },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="badge">🚨 24/7 Emergency Service Available</span>
          <h1>Fast & Reliable <span>Home Repair</span> Services at Your Doorstep</h1>
          <p>
            Got a plumbing leak, electrical fault, or AC breakdown? Don't stress! 
            Our expert technicians are just a click away to solve your emergencies.
          </p>
          <div className="hero-buttons">
            <a href="#quick-book" className="btn btn-primary">Book Now</a>
            <a href="tel:+919876543210" className="btn btn-secondary">📞 Call Us Immediately</a>
          </div>
        </div>

        {/* Hero-യിൽ തത്സമയം ബുക്കിംഗ് ചെയ്യാൻ ചെറിയ ഫോം */}
        <div className="hero-form-wrapper" id="quick-book">
          <BookingForm />
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-title">
          <h2>Our Emergency Services</h2>
          <p>Choose from our wide range of professional repair & maintenance services</p>
        </div>

        <div className="services-grid">
          {services.map((item) => (
            <div key={item.id} className="service-card">
              <div className="service-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
             <Link
              to={`/book?service=${encodeURIComponent(item.title)}`}
              className="service-link"
            >
              Book This Service →
            </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-us-section">
        <div className="section-title">
          <h2>Why Choose Us?</h2>
          <p>We deliver peace of mind when unexpected household issues strike</p>
        </div>

        <div className="features-grid">
          {features.map((f, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="cta-banner">
        <h2>Facing an Immediate Emergency?</h2>
        <p>Our team is ready to respond right now. Get your home fixed in no time!</p>
        <a href="tel:+919988774455" className="cta-btn">Call +91 9988774455</a>
      </section>
    </div>
  );
}