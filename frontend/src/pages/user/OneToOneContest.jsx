import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import '../../styles/UserDashboard.css'; 

const OneToOneContest = () => {
    const navigate = useNavigate();
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Config State
    const [keyboardType, setKeyboardType] = useState('Full Keyboard');
    const [contestMode, setContestMode] = useState('Free Contest'); // Free Contest | Paid Contest
    const [entryFee, setEntryFee] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');

    const wrapperRef = useRef(null);
    const isMounted = useRef(false);

    // Debounce Search
    useEffect(() => {
        if (isMounted.current) {
            const delayDebounceFn = setTimeout(() => {
                if (!selectedUser) { 
                    searchUsers();
                } else if (searchQuery !== selectedUser.username) {
                    // If user changed the input after selection, clear selection and search
                    setSelectedUser(null);
                    searchUsers();
                }
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        } else {
            isMounted.current = true;
        }
    }, [searchQuery]);

    // Clear selection if user types
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (selectedUser) {
            setSelectedUser(null); 
        }
    };

    const handleFocus = () => {
        if (!selectedUser) {
            searchUsers();
        }
        setShowDropdown(true);
    };

    const searchUsers = async () => {
        try {
            setSearchLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/user/search?q=${searchQuery}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            const data = await res.json();
            setSearchResults(data);
            setShowDropdown(true);
        } catch (err) {
            console.error(err);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSearchQuery(user.username);
        setShowDropdown(false);
        setError('');
    };

    const handleSubmit = async () => {
        if (!selectedUser) {
            setError('Please select a competitor.');
            return;
        }
        if (!scheduledTime) {
            setError('Please select a date and time.');
            return;
        }
        const normalizedEntryFee = Number(entryFee);
        if (contestMode === 'Paid Contest' && (!Number.isFinite(normalizedEntryFee) || normalizedEntryFee <= 0)) {
            setError('Please enter a valid amount for paid contest.');
            return;
        }

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
                    contestType: keyboardType, // API expects contestType
                    contestMode,
                    entryFee: contestMode === 'Paid Contest' ? normalizedEntryFee : 0,
                    scheduledTime: new Date(scheduledTime).toISOString()
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Failed to create contest');
            }

            // alert('Contest request sent successfully!');
            navigate('/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="one-to-one-page" style={{ padding: '40px', minHeight: '100vh', background: '#f5f7fa' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0, fontWeight: '800', color: '#333', textTransform: 'uppercase' }}>
                        ONE TO ONE TYPING CONTEST
                    </h2>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{
                            padding: '10px 20px',
                            background: '#eee',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Card */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '20px', 
                    padding: '40px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
                }}>
                    
                    {/* Search Section */}
                    <div style={{ marginBottom: '30px', textAlign: 'center', position: 'relative', maxWidth: '80%', margin: '0 auto 30px' }} ref={wrapperRef}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '15px', 
                            fontWeight: '700', 
                            fontSize: '18px', 
                            color: '#333'
                        }}>
                            Type Here Username or User Code to Search Your Competitor
                        </label>
                        <input 
                            type="text" 
                            placeholder="Type Here" 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleFocus}
                            onClick={handleFocus}
                            style={{
                                width: '100%',
                                padding: '15px 20px',
                                borderRadius: '30px',
                                border: '2px solid #3b82f6', // Blue border
                                fontSize: '16px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        
                        {/* Dropdown Results */}
                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                marginTop: '5px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                zIndex: 1000,
                                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                            }}>
                                {searchLoading ? (
                                    <div style={{ padding: '15px', textAlign: 'center', color: '#666' }}>Loading...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <div 
                                            key={user._id}
                                            onClick={() => handleSelectUser(user)}
                                            style={{
                                                padding: '10px 15px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #eee',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <strong>{user.username}</strong> 
                                            <span style={{ color: '#888', fontSize: '12px', marginLeft: '5px' }}>({user.uniqueKey})</span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                                        No users found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Keyboard */}
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                            <label style={{ fontWeight: '700', color: '#444' }}>Keyboard</label>
                            <select 
                                value={keyboardType} 
                                onChange={(e) => setKeyboardType(e.target.value)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    width: '100%',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="Full Keyboard">Full Keyboard</option>
                                <option value="Basic Home Row">Basic Home Row</option>
                                <option value="Numeric Keys">Numeric Keys</option>
                            </select>
                        </div>

                        {/* Date & Time */}
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                            <label style={{ fontWeight: '700', color: '#444' }}>Date & Time</label>
                            <input 
                                type="datetime-local" 
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    width: '100%',
                                    fontSize: '16px',
                                    fontFamily: 'monospace' // To match the look in image roughly
                                }}
                            />
                        </div>

                        {/* Contest Type (Mode) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                            <label style={{ fontWeight: '700', color: '#444' }}>Contest Type</label>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => {
                                        setContestMode('Free Contest');
                                        setEntryFee('');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: contestMode === 'Free Contest' ? '#7c00e7' : '#f0f0f0',
                                        color: contestMode === 'Free Contest' ? 'white' : '#333',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Free Contest
                                </button>
                                <button
                                    onClick={() => setContestMode('Paid Contest')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: contestMode === 'Paid Contest' ? '#7c00e7' : '#f0f0f0',
                                        color: contestMode === 'Paid Contest' ? 'white' : '#333',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Paid Contest
                                </button>
                            </div>
                        </div>

                        {contestMode === 'Paid Contest' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                <label style={{ fontWeight: '700', color: '#444' }}>Amount</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={entryFee}
                                    onChange={(e) => setEntryFee(e.target.value)}
                                    placeholder="Enter amount"
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        width: '100%',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{
                                    padding: '15px 40px',
                                    background: '#7c00e7',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    width: '200px',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OneToOneContest;
