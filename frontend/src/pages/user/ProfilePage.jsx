
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import '../../styles/UserDashboard.css'; // Reusing dashboard styles

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const body = {
        username: formData.username,
        email: formData.email
      };
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        updateUser(data); // Update context
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setMsg({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Edit Profile</h2>
        
        {msg.text && (
          <div style={{ 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            backgroundColor: msg.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: msg.type === 'error' ? '#c62828' : '#2e7d32'
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>New Password (Optional)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          </div>

          {formData.password && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#A020F0',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
