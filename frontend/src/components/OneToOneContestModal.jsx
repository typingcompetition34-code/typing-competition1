import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import '../styles/UserDashboard.css'; // Reuse dashboard styles

const OneToOneContestModal = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Config State
    const [contestType, setContestType] = useState('Full Keyboard');
    const [contestMode, setContestMode] = useState('Free Contest');
    const [entryFee, setEntryFee] = useState(0);
    const [scheduledTime, setScheduledTime] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 1) {
                searchUsers();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const searchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/user/search?q=${searchQuery}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            const data = await res.json();
            setSearchResults(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setStep(2);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/one-to-one/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    opponentId: selectedUser._id,
                    contestType,
                    contestMode,
                    entryFee: contestMode === 'Paid Contest' ? Number(entryFee) : 0,
                    scheduledTime: new Date(scheduledTime).toISOString()
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Failed to create contest');
            }

            alert('Contest request sent successfully!');
            onSuccess();
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-modal-overlay">
            <div className="user-modal-content" style={{ maxWidth: '600px' }}>
                <button className="close-btn" onClick={onClose}>&times;</button>
                
                {step === 1 ? (
                    <div className="search-step">
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                            Type Here Username or User Code<br/>to Search Your Competitor
                        </h2>
                        
                        <div className="search-bar-container" style={{ position: 'relative', display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Type Here"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ 
                                    padding: '15px', 
                                    borderRadius: '30px', 
                                    border: '2px solid #007bff',
                                    flex: 1
                                }}
                            />
                            <button 
                                className="btn-primary" 
                                style={{ 
                                    borderRadius: '50%', 
                                    width: '50px', 
                                    height: '50px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}
                            >
                                <i className="fas fa-search"></i>
                            </button>
                        </div>

                        {loading && <p style={{ textAlign: 'center', marginTop: '10px' }}>Searching...</p>}

                        {searchResults.length > 0 && (
                            <ul className="user-list" style={{ 
                                listStyle: 'none', 
                                padding: 0, 
                                marginTop: '20px', 
                                maxHeight: '300px', 
                                overflowY: 'auto',
                                border: '1px solid #ddd',
                                borderRadius: '10px'
                            }}>
                                {searchResults.map(user => (
                                    <li 
                                        key={user._id} 
                                        onClick={() => handleSelectUser(user)}
                                        style={{ 
                                            padding: '15px', 
                                            borderBottom: '1px solid #eee', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#f9f9f9'}
                                        onMouseLeave={(e) => e.target.style.background = 'white'}
                                    >
                                        <div>
                                            <strong>{user.username}</strong>
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>ID: {user.uniqueKey || 'N/A'}</div>
                                        </div>
                                        <button className="btn-small btn-secondary">Select</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        
                        {searchResults.length === 0 && searchQuery.length > 1 && !loading && (
                            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No users found.</p>
                        )}
                    </div>
                ) : (
                    <div className="config-step">
                        <h2>Setup Contest with {selectedUser.username}</h2>
                        <button className="btn-text" onClick={() => setStep(1)} style={{ marginBottom: '20px' }}>&larr; Back to Search</button>
                        
                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Contest Type</label>
                                <select 
                                    className="form-control" 
                                    value={contestType} 
                                    onChange={(e) => setContestType(e.target.value)}
                                >
                                    <option value="Full Keyboard">Full Keyboard</option>
                                    <option value="Basic Home Row">Basic Home Row</option>
                                    <option value="Numeric Keys">Numeric Keys</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Contest Mode</label>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input 
                                            type="radio" 
                                            value="Free Contest" 
                                            checked={contestMode === 'Free Contest'} 
                                            onChange={(e) => setContestMode(e.target.value)} 
                                        />
                                        Free Contest
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input 
                                            type="radio" 
                                            value="Paid Contest" 
                                            checked={contestMode === 'Paid Contest'} 
                                            onChange={(e) => setContestMode(e.target.value)} 
                                        />
                                        Paid Contest
                                    </label>
                                </div>
                            </div>

                            {contestMode === 'Paid Contest' && (
                                <div className="form-group">
                                    <label>Entry Fee (Amount)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={entryFee} 
                                        onChange={(e) => setEntryFee(e.target.value)}
                                        min="1"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control" 
                                    value={scheduledTime} 
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                                {loading ? 'Creating...' : 'Send Challenge Request'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OneToOneContestModal;
