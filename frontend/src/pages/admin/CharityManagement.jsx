import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import '../../styles/TournamentManagement.css'; // Reusing styles

const CharityManagement = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    goalAmount: '',
    description: '',
    video: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchCharities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/charities?status=all`);
      const data = await res.json();
      setCharities(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching charities:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCharities();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, video: e.target.files[0] }));
  };

  const resetForm = () => {
    setFormData({ title: '', goalAmount: '', description: '', video: null });
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('goalAmount', formData.goalAmount);
    data.append('description', formData.description);
    if (formData.video) {
      data.append('video', formData.video);
    }

    try {
      const url = isEditing 
        ? `${API_BASE_URL}/api/charities/${editId}`
        : `${API_BASE_URL}/api/charities`;
        
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: data
      });
      if (res.ok) {
        resetForm();
        fetchCharities();
      }
    } catch (err) {
      console.error('Error saving charity:', err);
    }
  };

  const handleEdit = (charity) => {
    setFormData({
      title: charity.title,
      goalAmount: charity.goalAmount,
      description: charity.description,
      video: null // Reset video input as we can't prefill file input
    });
    setEditId(charity._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/charities/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchCharities();
        }
      } catch (err) {
        console.error('Error deleting charity:', err);
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'completed' : 'active';
    try {
      await fetch(`${API_BASE_URL}/api/charities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchCharities();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="admin-header" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
        <h1 style={{ margin: 0 }}>Charity Management</h1>
        <button 
          className="create-btn" 
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ padding: '12px 24px', fontSize: '1.1rem', alignSelf: 'flex-end' }}
        >
          + New Campaign
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading campaigns...</div>
      ) : (
        <div className="tournaments-grid">
          {charities.map(charity => (
            <div key={charity._id} className="tournament-card">
              <div className="card-header">
                <h3>{charity.title}</h3>
                <span className={`status-badge ${charity.status}`}>
                  {charity.status}
                </span>
              </div>
              <p>{charity.description.substring(0, 100)}...</p>
              <div className="card-stats">
                <div className="stat">
                  <span className="label">Goal:</span>
                  <span className="value" style={{marginLeft: '5px'}}>{charity.goalAmount}</span>
                </div>
                <div className="stat">
                  <span className="label">Raised:</span>
                  <span className="value" style={{marginLeft: '5px'}}>{charity.raisedAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="card-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  className="action-btn edit"
                  onClick={() => toggleStatus(charity._id, charity.status)}
                  style={{ flex: 1 }}
                >
                  {charity.status === 'active' ? 'Mark Completed' : 'Activate'}
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleEdit(charity)}
                  style={{ flex: 1, background: '#f39c12', color: 'white' }}
                >
                  Edit
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleDelete(charity._id)}
                  style={{ flex: 1, background: '#e74c3c', color: 'white' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit Charity Campaign' : 'Create Charity Campaign'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Goal Amount</label>
                <input
                  type="number"
                  name="goalAmount"
                  value={formData.goalAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description / Story</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Video Upload {isEditing && '(Leave empty to keep current)'}</label>
                <input
                  type="file"
                  name="video"
                  onChange={handleFileChange}
                  accept="video/*"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {isEditing ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharityManagement;
