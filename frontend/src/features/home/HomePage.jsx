import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';
import OnlineUsers from './OnlineUsers';
import './HomePage.scss';
import ErrorBoundary from '../../components/ErrorBoundary';
import Feed from '../feed/components/Feed';

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
          <ErrorBoundary>
            <Feed />
          </ErrorBoundary>
        </main>
        <div className="hp-right">
          <OnlineUsers />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
