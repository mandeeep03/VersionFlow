import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          WORKSPACE
        </Link>
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Dashboard
          </Link>
          <Link to="/projects" className="nav-link">
            Projects
          </Link>
          <Link to="/analytics" className="nav-link">
            Analytics
          </Link>
          <Link to="/subscription" className="nav-link">
            Plans
          </Link>
          <div className="nav-user">
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
