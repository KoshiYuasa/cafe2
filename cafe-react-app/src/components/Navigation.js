import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Survey
        </Link>
        <Link 
          to="/chart" 
          className={`nav-link ${location.pathname === '/chart' ? 'active' : ''}`}
        >
          Chart
        </Link>
        <Link 
          to="/table" 
          className={`nav-link ${location.pathname === '/table' ? 'active' : ''}`}
        >
          Table
        </Link>
      </div>
    </nav>
  );
}

export default Navigation; 