import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import '../../styles/AdminDashboard.css';

const WalletDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/admin`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();
      // Filter for wallet deposits only
      const walletDeposits = data.filter(d => d.type === 'wallet_deposit');
      setDeposits(walletDeposits);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this deposit?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/${id}/action`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token') 
        },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        setMsg(`Deposit ${action}d successfully`);
        fetchDeposits();
      } else {
        const data = await res.json();
        alert(data.message || 'Error processing request');
      }
    } catch (err) {
      console.error(err);
      alert('Server Error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Wallet Deposit Requests</h1>
      </div>

      {msg && <div className="success-message" style={{marginBottom: '20px'}}>{msg}</div>}

      <div className="section-container">
        {loading ? (
          <p>Loading...</p>
        ) : deposits.length === 0 ? (
          <p>No deposit requests found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Receipt</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map(deposit => (
                <tr key={deposit._id}>
                  <td>{new Date(deposit.createdAt).toLocaleDateString()} {new Date(deposit.createdAt).toLocaleTimeString()}</td>
                  <td>
                    <div>{deposit.user?.username}</div>
                    <div style={{fontSize: '0.8rem', color: '#666'}}>{deposit.user?.email}</div>
                  </td>
                  <td style={{fontWeight: 'bold'}}>{deposit.amount}</td>
                  <td>
                    {deposit.paymentMethod?.title || 'Unknown'}
                    {deposit.paymentMethod?.details && (
                        <div style={{fontSize: '0.8rem', color: '#666'}}>{deposit.paymentMethod.details.substring(0, 20)}...</div>
                    )}
                  </td>
                  <td>
                    {deposit.receiptUrl ? (
                      <a 
                        href={`${API_BASE_URL}/${deposit.receiptUrl.replace(/\\/g, '/')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{color: '#A020F0', textDecoration: 'underline'}}
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span style={{color: '#999'}}>No Receipt</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${deposit.status}`}>{deposit.status}</span>
                  </td>
                  <td>
                    {deposit.status === 'pending' && (
                        <div style={{display: 'flex', gap: '5px'}}>
                            <button 
                            onClick={() => handleAction(deposit._id, 'approve')} 
                            className="btn-primary"
                            style={{padding: '5px 10px', fontSize: '0.8rem', backgroundColor: '#4CAF50'}}
                            >
                            Approve
                            </button>
                            <button 
                            onClick={() => handleAction(deposit._id, 'reject')} 
                            className="btn-primary"
                            style={{padding: '5px 10px', fontSize: '0.8rem', backgroundColor: '#f44336'}}
                            >
                            Reject
                            </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WalletDeposits;