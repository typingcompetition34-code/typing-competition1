import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/final logo.svg';

const UserHeader = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
          <img src={logo} alt="Charity Typing" className="header-logo" />
        </Link>
      </div>
      
      {/* Search Bar Removed */}

      <div className="nav-right">
        {user ? (
          <>
            <span className="welcome-msg">Hi, {user.username}</span>
            <Link to="/practice" className="nav-btn">
              Practice
            </Link>
            <Link to="/dashboard" className="nav-btn">
              Dashboard
            </Link>
            <Link to="/profile" className="nav-btn">
              Profile
            </Link>
            <button onClick={logout} className="nav-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn">
              Log in
            </Link>
            <Link to="/register" className="nav-btn">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default UserHeader;
