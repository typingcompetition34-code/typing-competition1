import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import '../../styles/TournamentManagement.css';

const TournamentManagement = () => {
  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: 'Group',
    maxParticipants: 100,
    entryFee: 0,
    difficulty: 'Medium',
    customText: 'The quick brown fox jumps over the lazy dog.'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null); // { tournamentId: ..., data: [] }
  const API_URL = `${API_BASE_URL}/api/tournaments`;

  const fetchTournaments = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map(item => ({
          id: item._id,
          title: item.title,
          description: item.description,
          startDate: item.startDate,
          endDate: item.endDate,
          category: item.category,
          maxParticipants: item.maxParticipants,
          entryFee: item.entryFee,
          difficulty: item.difficulty,
          customText: item.customText,
          status: item.status
        }));
        setTournaments(mappedData);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTournaments();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchTournaments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : formData.startDate,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : formData.endDate
      };

      const url = isEditing ? `${API_URL}/${editId}` : API_URL;
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchTournaments();
        resetForm();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  };

  const handleEdit = (tournament) => {
    setFormData({
      title: tournament.title,
      description: tournament.description,
      startDate: formatDateForInput(tournament.startDate),
      endDate: formatDateForInput(tournament.endDate),
      category: tournament.category || 'Group',
      maxParticipants: tournament.maxParticipants || 100,
      entryFee: tournament.entryFee || 0,
      difficulty: tournament.difficulty || 'Medium',
      customText: tournament.customText || ''
    });
    setIsEditing(true);
    setEditId(tournament.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStop = async (id) => {
    if (!window.confirm('Are you sure you want to STOP this tournament? It will be removed from user view.')) return;
    try {
      const response = await fetch(`${API_URL}/${id}/stop`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchTournaments();
      }
    } catch (error) {
      console.error('Error stopping tournament:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchTournaments();
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const handleCloneClick = (tournament) => {
    setFormData({
      title: `${tournament.title} (Copy)`,
      description: tournament.description,
      startDate: '',
      endDate: '',
      category: tournament.category || 'Group',
      maxParticipants: tournament.maxParticipants || 100,
      entryFee: tournament.entryFee || 0,
      difficulty: tournament.difficulty || 'Medium',
      customText: tournament.customText || ''
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewLeaderboard = async (id) => {
    if (leaderboard && leaderboard.tournamentId === id) {
      setLeaderboard(null); // Toggle off
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${id}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard({ tournamentId: id, data });
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      category: 'Group',
      maxParticipants: 100,
      entryFee: 0,
      difficulty: 'Medium',
      customText: 'The quick brown fox jumps over the lazy dog.'
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleCreateClick = () => {
    resetForm();
    setShowForm(true);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adjust for local timezone offset to ensure input shows correct local time
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const formatDateDisplay = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="tournament-management">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
        {!showForm && (
          <button onClick={handleCreateClick} className="btn-primary">
            + Create Tournament
          </button>
        )}
      </div>
      
      <div className="admin-grid">
        {showForm ? (
          <div className="form-section">
            <h3>{isEditing ? 'Edit Tournament' : 'Create New Tournament'}</h3>
            <form onSubmit={handleSubmit} className="tournament-form">
              <div className="form-group">
                <label>Tournament Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Charity Speed Typing 2024"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Details about the event..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="Group">Group</option>
                    <option value="1v1">1v1 Duel</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Participants</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    min="2"
                  />
                </div>

                <div className="form-group">
                  <label>Entry Fee</label>
                  <input
                    type="number"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Custom Typing Text (Competition Content)</label>
                <textarea
                  name="customText"
                  value={formData.customText}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Enter the text participants will type..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update Tournament' : 'Create Tournament'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="list-section expanded-view">
            <h3>Existing Tournaments</h3>
          <div className="tournament-list">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className={`tournament-card status-${tournament.status}`}>
                <div className="card-header">
                  <h4>{tournament.title}</h4>
                  <span className={`status-badge ${tournament.status}`}>{tournament.status}</span>
                </div>
                
                <div className="card-details">
                  <p><strong>Category:</strong> {tournament.category} | <strong>Difficulty:</strong> {tournament.difficulty}</p>
                  <p><strong>Start:</strong> {formatDateDisplay(tournament.startDate)}</p>
                  <p><strong>End:</strong> {formatDateDisplay(tournament.endDate)}</p>
                  <p><strong>Fee:</strong> {tournament.entryFee} | <strong>Max:</strong> {tournament.maxParticipants}</p>
                </div>

                <div className="card-actions">
                  <button onClick={() => handleCloneClick(tournament)} className="btn-small">Repeat</button>
                  <button onClick={() => handleEdit(tournament)} className="btn-small">Edit</button>
                  
                  {tournament.status !== 'stopped' && tournament.status !== 'completed' && (
                    <button onClick={() => handleStop(tournament.id)} className="btn-small btn-warning">Stop</button>
                  )}
                  
                  <button onClick={() => handleDelete(tournament.id)} className="btn-small btn-danger">Delete</button>
                  <button onClick={() => handleViewLeaderboard(tournament.id)} className="btn-small btn-info">
                    {leaderboard && leaderboard.tournamentId === tournament.id ? 'Hide Results' : 'Live Results'}
                  </button>
                </div>

                {leaderboard && leaderboard.tournamentId === tournament.id && (
                  <div className="leaderboard-panel">
                    <h5>Live Leaderboard</h5>
                    {leaderboard.data.length === 0 ? (
                      <p className="no-data">No results yet.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>User</th>
                            <th>WPM</th>
                            <th>Acc</th>
                            <th>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.data.map((res, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{res.userId}</td>
                              <td>{res.wpm}</td>
                              <td>{res.accuracy}%</td>
                              <td>{res.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default TournamentManagement;
