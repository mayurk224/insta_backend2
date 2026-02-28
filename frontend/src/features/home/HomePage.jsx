import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';
import OnlineUsers from './OnlineUsers';
import './HomePage.scss';

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="hp-root">
      <NavBar />
      <button
        type="button"
        className="hp-mobile-open"
        aria-controls="sidebar-nav"
        aria-expanded={sidebarOpen ? 'true' : 'false'}
        onClick={() => setSidebarOpen((v) => !v)}
      >
        Menu
      </button>
      <div className="hp-shell">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="hp-center" aria-label="Feed">
          <h1 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '1rem' }}>
            Home
          </h1>
          <p style={{ color: '#6b7280' }}>Your feed will appear here.</p>
        </main>
        <div className="hp-right">
          <OnlineUsers />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
