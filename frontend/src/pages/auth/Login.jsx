import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
        login(data.token, data.user);
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError('Something went wrong. Please check your connection and try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ border: '2px solid #6f42c1', boxShadow: '0 8px 24px rgba(111, 66, 193, 0.25)' }}>
        <h2 style={{ fontWeight: 'bold' }}>User Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
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
          <button type="submit" className="btn-primary full-width">Login</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
