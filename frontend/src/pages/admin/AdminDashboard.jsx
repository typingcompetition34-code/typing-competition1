import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    activeCount: 0,
    totalCount: 0,
    charityCount: 0,
    participants: 0, // Placeholder as we don't track total users yet
    totalFee: 0,
    totalDonation: 0,
    totalWallet: 0,
    totalSpent: 0, // New stat
    totalRedeemed: 0 // New stat
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchCharities();
    fetchTransactions();
    fetchUserCount();
    fetchWalletTotal();
    fetchRedeemTotal(); // New fetch
  }, []);

  const copyText = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    } catch {
      return;
    }
  };

  const fetchUserCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/count`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          participants: data.count
        }));
      } else {
        console.error('Failed to fetch user count');
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  const fetchWalletTotal = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/wallet-total`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          totalWallet: data.total,
          totalSpent: data.totalSpent
        }));
      }
    } catch (error) {
      console.error('Error fetching wallet total:', error);
    }
  };

  const fetchRedeemTotal = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/redeem/stats`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          totalRedeemed: data.totalRedeemed
        }));
      }
    } catch (error) {
      console.error('Error fetching redeem total:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tournaments`);
      if (response.ok) {
        const data = await response.json();
        const active = data.filter(t => t.status === 'active').length;
        setStats(prev => ({
          ...prev,
          activeCount: active,
          totalCount: data.length
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCharities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charities?status=all`);
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          charityCount: data.length
        }));
      }
    } catch (error) {
      console.error('Error fetching charities:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
        
        const totalFee = data
            .filter(t => t.type === 'Entry Fee' || t.type === 'Contest Fee')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            
        const totalDonation = data
            .filter(t => t.type === 'Donation')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        setStats(prev => ({
            ...prev,
            totalFee,
            totalDonation
        }));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
           <Link to="/admin/tournaments" className="btn-primary" style={{marginRight: '10px'}}>Manage Tournaments</Link>
           <Link to="/admin/charities" className="btn-primary">Manage Charities</Link>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <h3>Active Contests</h3>
          <p>{stats.activeCount}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Tournaments</h3>
          <p>{stats.totalCount}</p>
        </div>

        <div className="stat-card">
          <h3>Total Charities</h3>
          <p>{stats.charityCount}</p>
        </div>

        <Link to="/admin/users" className="stat-card" style={{textDecoration: 'none', color: 'inherit', position: 'relative'}}>
          <div style={{position: 'absolute', top: '10px', right: '10px'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <h3>Total Users</h3>
          <p>{stats.participants}</p>
        </Link>

        <div className="stat-card">
          <h3>Total Fee</h3>
          <p>{stats.totalFee.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Total Donations</h3>
          <p>{stats.totalDonation.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Total User Wallet</h3>
          <p className="stat-number">{stats.totalWallet.toFixed(2)}</p>
          <span className="stat-label">Total in User Wallets</span>
        </div>

        <div className="stat-card">
          <h3>Admin Wallet</h3>
          <p className="stat-number">{stats.totalSpent?.toFixed(2) || '0.00'}</p>
          <span className="stat-label">Net Available Balance</span>
        </div>

        <div className="stat-card">
          <h3>Total Redeemed</h3>
          <p className="stat-number">{stats.totalRedeemed.toFixed(2)}</p>
          <span className="stat-label">Total Approved Redeems</span>
        </div>
      </div>

      <div className="section-container">
        <h3>Recent Transactions (Deposit List)</h3>
        {transactions.length > 0 ? (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>User</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Charity Cause</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{t.userId?.username || 'Unknown'}</td>
                  <td style={{ padding: '12px' }}>{t.type}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{t.amount}</td>
                  <td style={{ padding: '12px', color: t.charityId ? 'var(--primary-600)' : '#888' }}>
                    {t.charityId?.title || '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`status-badge ${t.status ? t.status.toLowerCase() : 'completed'}`}>{t.status || 'Completed'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray">No recent activity to show.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
