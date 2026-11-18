
import React, { useState } from 'react';

const API_URL = 'https://emergency-home-services-api.onrender.com/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState({
    type: '',
    message: '',
  });

  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSending(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send message.');
      }

      setStatus({
        type: 'success',
        message:
          'Message Sent Successfully! Our team will contact you soon.',
      });

      setFormData({
        name: '',
        email: '',
        message: '',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error.message === 'Failed to fetch'
            ? 'Unable to connect to the server. Please try again.'
            : error.message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: '#0f172a',
          fontSize: '2rem',
          marginBottom: '0.5rem',
        }}
      >
        Contact Us
      </h2>

      <p
        style={{
          textAlign: 'center',
          color: '#64748b',
          marginBottom: '2.5rem',
        }}
      >
        Have a question? Reach out to us anytime.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
            Get in Touch
          </h3>

          <p style={{ marginBottom: '1rem' }}>
            📍 <strong>Address:</strong> Main Road, City Center, Kerala
          </p>
          <p style={{ marginBottom: '1rem' }}>
            📞 <strong>Phone:</strong> +91 98765 43210
          </p>
          <p style={{ marginBottom: '1rem' }}>
            ✉️ <strong>Email:</strong> support@emergencyhome.com
          </p>
          <p style={{ marginBottom: '1rem' }}>
            ⏰ <strong>Working Hours:</strong> 24/7 Open
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>
            Send a Message
          </h3>

          {status.message && (
            <div
              role="status"
              aria-live="polite"
              style={{
                padding: '0.9rem',
                marginBottom: '1rem',
                borderRadius: '6px',
                background:
                  status.type === 'success' ? '#dcfce7' : '#fee2e2',
                color:
                  status.type === 'success' ? '#166534' : '#991b1b',
              }}
            >
              {status.type === 'success' ? '✅ ' : '❌ '}
              {status.message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              style={{
                padding: '0.7rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
              }}
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={254}
              style={{
                padding: '0.7rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
              }}
            />

            <textarea
              name="message"
              rows="4"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
              maxLength={5000}
              style={{
                padding: '0.7rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
              }}
            />

            <button
              type="submit"
              disabled={sending}
              style={{
                background: sending ? '#64748b' : '#0f172a',
                color: '#fff',
                border: 'none',
                padding: '0.8rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: sending ? 'not-allowed' : 'pointer',
              }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
