import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../styles/Auth.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.user.role === 'admin') {
          login(data.token, data.user);
          navigate('/admin/dashboard');
        } else {
          setError('Access Denied: Not an admin account');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', paddingBottom: 0 }}>
      <div className="auth-card" style={{ border: '3px solid #6f42c1', boxShadow: '0 8px 24px rgba(111, 66, 193, 0.25)' }}>
        <h2 style={{ fontWeight: '900', color: '#6f42c1' }}>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <button type="submit" className="btn-primary full-width">Admin Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
