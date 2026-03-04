import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="app-header">
      <div className="brand-logo" onClick={() => navigate('/admin/dashboard')}>
        
      </div>
      
      <div className="user-actions">
        <button 
          className="btn-secondary btn-small"
          onClick={() => navigate('/admin/profile')}
        >
          Admin Profile
        </button>
        <button 
          className="btn-primary btn-small"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </header>
  );
};

export default Header;
