import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li 
          className={`sidebar-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/admin/dashboard')}
        >
          <span>📊</span> Dashboard
        </li>
        <li 
          className={`sidebar-item ${isActive('/admin/tournaments') ? 'active' : ''}`}
          onClick={() => navigate('/admin/tournaments')}
        >
          <span>🏆</span> Tournament Management
        </li>
        <li 
          className={`sidebar-item ${isActive('/admin/charities') ? 'active' : ''}`}
          onClick={() => navigate('/admin/charities')}
        >
          <span>❤️</span> Charity Management
        </li>
        <li 
          className={`sidebar-item ${isActive('/admin/deposits') ? 'active' : ''}`}
          onClick={() => navigate('/admin/deposits')}
        >
          <span>💵</span> Wallet Deposits
        </li>
        <li 
          className={`sidebar-item ${isActive('/admin/redeem-requests') ? 'active' : ''}`}
          onClick={() => navigate('/admin/redeem-requests')}
        >
          <span>💸</span> Redeem Requests
        </li>
        <li 
          className={`sidebar-item ${isActive('/admin/transactions') ? 'active' : ''}`}
          onClick={() => navigate('/admin/transactions')}
        >
          <span>🧾</span> Transactions
        </li>
        <li 
          className={`sidebar-item ${isActive('/admin/payment-methods') ? 'active' : ''}`}
          onClick={() => navigate('/admin/payment-methods')}
        >
          <span>💳</span> Payment Methods
        </li>
        <li 
          className={`sidebar-item ${isActive('/admin/users') ? 'active' : ''}`}
          onClick={() => navigate('/admin/users')}
        >
          <span>👥</span> User Management
        </li>
      </ul>
      

    </aside>
  );
};

export default Sidebar;
