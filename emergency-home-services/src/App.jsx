import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from "./pages/Login";

// Pages Import
import Home from './pages/Home';
import Services from './pages/Services';
import Emergency from './pages/Emergency';
import BookService from './pages/BookService';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

export default function App() {
  return (
    <div>
      <Navbar />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/book" element={<BookService />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/worker" element={<WorkerDashboard />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}