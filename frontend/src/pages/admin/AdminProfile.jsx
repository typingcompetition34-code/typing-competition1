import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AdminDashboard.css';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '', // Should be read-only or editable? User said "update its username and password" but admin usually has email too. Let's include it but maybe read-only if not requested. Actually user said "update its username , email and password" in previous turn, but this time "admin username and password". I'll include email as editable for completeness but focus on username/password.
    password: '',
    confirmPassword: ''
  });
  const [msg, setMsg] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username,
        email: user.email
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', content: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMsg({ type: 'error', content: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, { // Using the same profile update route as regular users since admin is also a user
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password || undefined
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMsg({ type: 'success', content: 'Profile updated successfully' });
        updateUser(data); // Update local context
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setMsg({ type: 'error', content: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', content: 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="header-actions">
        <h2>Admin Profile</h2>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
        {msg.content && (
          <div className={`alert ${msg.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            backgroundColor: msg.type === 'error' ? '#fdecea' : '#eafaf1',
            color: msg.type === 'error' ? '#dc3545' : '#28a745',
            border: `1px solid ${msg.type === 'error' ? '#dc3545' : '#28a745'}`
          }}>
            {msg.content}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>New Password (leave blank to keep current)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
