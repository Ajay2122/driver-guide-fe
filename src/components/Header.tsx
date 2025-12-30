import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <Link to="/" className="logo">
            <span className="logo-icon">🚛</span>
            <div className="logo-text">
              <span className="logo-main">Driver Log</span>
              <span className="logo-sub">HOS TRACKING SYSTEM</span>
            </div>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            📊 Dashboard
          </Link>
          <Link to="/logs" className={`nav-link ${isActive('/logs')}`}>
            📋 All Logs
          </Link>
          <Link to="/create" className={`nav-link ${isActive('/create')}`}>
            ➕ New Log
          </Link>
          <Link to="/drivers" className={`nav-link ${isActive('/drivers')}`}>
            👤 Drivers
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;





