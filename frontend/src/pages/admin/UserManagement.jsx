import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AdminDashboard.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/all`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched users:', data);
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetWallet = async (userId, username) => {
    if (!userId) {
        alert('Error: User ID is missing');
        return;
    }
    if (!window.confirm(`Are you sure you want to reset the wallet for ${username}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/admin/reset-wallet/${userId}`, {
        method: 'PUT',
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });

      // Check content type
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          if (res.ok) {
            setMsg(data.message);
            fetchUsers();
            setTimeout(() => setMsg(''), 3000);
          } else {
            alert(data.message || 'Failed to reset wallet');
          }
      } else {
          const text = await res.text();
          console.error('Non-JSON response:', text);
          alert(`Server error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to reset wallet: ${err.message}`);
    }
  };

  const handleResetAllWallets = async () => {
    if (!window.confirm('WARNING: This will reset the wallet balance of ALL users to 0. This action cannot be undone. Are you sure?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/admin/reset-all-wallets`, {
        method: 'PUT',
        headers: { 
            'x-auth-token': localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
      });

      if (res.status === 401 || res.status === 403) {
          alert('Authorization failed. Please try logging out and logging in again.');
          return;
      }

      // Check content type
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          if (res.ok) {
            setMsg(data.message);
            fetchUsers();
            // Clear message after 3 seconds
            setTimeout(() => setMsg(''), 3000);
          } else {
            alert(data.message || 'Failed to reset all wallets');
          }
      } else {
          const text = await res.text();
          console.error('Non-JSON response:', text);
          alert(`Server error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to reset all wallets: ${err.message}`);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, username) => {
    if (!userId) {
        alert('Error: User ID is missing');
        return;
    }
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} user ${username}?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/user/admin/toggle-status/${userId}`, {
            method: 'PUT',
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        
        // Check content type to avoid JSON parse errors on non-JSON responses
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await res.json();
            if (res.ok) {
                setMsg(data.message);
                fetchUsers();
                setTimeout(() => setMsg(''), 3000);
            } else {
                alert(data.message || `Failed to ${action} user`);
            }
        } else {
            // Handle non-JSON response (e.g. 404 HTML or 500 text)
            const text = await res.text();
            console.error('Non-JSON response:', text);
            alert(`Server error: ${res.status} ${res.statusText}`);
        }
    } catch (err) {
        console.error(err);
        alert(`Failed to ${action} user: ${err.message}`);
    }
  };

  return (
    <div className="admin-content" style={{ padding: '20px' }}>
      <div className="header-actions" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>User Management</h2>
        <div>
            <button className="btn-danger" onClick={handleResetAllWallets} style={{backgroundColor: '#ff4444'}}>Reset ALL Wallets</button>
        </div>
      </div>
      
      {msg && <p className="msg">{msg}</p>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Wallet Balance</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const isActive = user.isActive !== false;
              return (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                    <span className={`status ${user.role === 'admin' ? 'active' : ''}`}>
                        {user.role}
                    </span>
                </td>
                <td>
                    <span 
                        className="status-badge"
                        style={{
                            backgroundColor: isActive ? '#d4edda' : '#f8d7da',
                            color: isActive ? '#155724' : '#721c24'
                        }}
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>{(user.walletBalance || 0).toFixed(2)}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        className="btn-danger" 
                        disabled={currentUser && currentUser.id === user._id}
                        style={{
                            padding: '5px 10px', 
                            fontSize: '0.8rem', 
                            backgroundColor: (currentUser && currentUser.id === user._id) ? '#ccc' : (isActive ? '#ffc107' : '#28a745'),
                            color: (currentUser && currentUser.id === user._id) ? '#666' : (isActive ? '#000' : '#fff'),
                            border: 'none',
                            cursor: (currentUser && currentUser.id === user._id) ? 'not-allowed' : 'pointer',
                            opacity: (currentUser && currentUser.id === user._id) ? 0.6 : 1
                        }}
                        onClick={() => {
                            if (currentUser && currentUser.id === user._id) return;
                            handleToggleStatus(user._id, isActive, user.username);
                        }}
                    >
                        {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                        className="btn-danger" 
                        style={{padding: '5px 10px', fontSize: '0.8rem', backgroundColor: '#ff4444'}}
                        onClick={() => handleResetWallet(user._id, user.username)}
                    >
                        Reset Wallet
                    </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
