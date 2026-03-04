import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import '../../styles/AdminDashboard.css'; // Reuse existing styles

const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', details: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payment-methods`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();
      setMethods(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess('Payment method added successfully');
        setFormData({ title: '', details: '' });
        fetchMethods();
      } else {
        const data = await res.json().catch(() => ({ message: 'Failed to parse error response' }));
        setError(data.message || 'Error adding payment method');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Server Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });

      if (res.ok) {
        setMethods(methods.filter(m => m._id !== id));
      } else {
        alert('Error deleting method');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Payment Methods</h1>
      </div>

      <div className="section-container" style={{ marginBottom: '30px' }}>
        <h3>Add New Payment Method</h3>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Method Title (e.g. Bank Transfer, PayPal)</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Details (Account Number, Instructions, etc.)</label>
            <textarea 
              value={formData.details} 
              onChange={e => setFormData({...formData, details: e.target.value})} 
              required 
              rows="4"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <button type="submit" className="btn-primary">Add Method</button>
        </form>
      </div>

      <div className="section-container">
        <h3>Existing Payment Methods</h3>
        {loading ? (
          <p>Loading...</p>
        ) : methods.length === 0 ? (
          <p>No payment methods added yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods.map(method => (
                <tr key={method._id}>
                  <td>{method.title}</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{method.details}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(method._id)} 
                      className="btn-danger"
                      style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
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

export default PaymentMethods;
