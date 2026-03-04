import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import '../../styles/TournamentDetail.css';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canJoin, setCanJoin] = useState(false);
  const [timeMessage, setTimeMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  
  // Charity Modal State
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // 1. Fetch Tournament Data, Leaderboard & Charities
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Tournament Info
        const tRes = await fetch(`${API_BASE_URL}/api/tournaments/${id}`);
        if (!tRes.ok) throw new Error('Tournament not found');
        const tData = await tRes.json();
        setTournament(tData);

        // Check if user is already a participant
        if (user && tData.participants && tData.participants.some(p => p.userId === user.id || p.userId === user._id)) {
          setIsJoined(true);
        }

        // Fetch Leaderboard
        const lRes = await fetch(`http://localhost:5000/api/tournaments/${id}/leaderboard`);
        if (lRes.ok) {
          const lData = await lRes.json();
          setLeaderboard(lData);
        }

        // Fetch Charities (Active only)
        const cRes = await fetch('http://localhost:5000/api/charities?status=active');
        if (cRes.ok) {
          const cData = await cRes.json();
          setCharities(cData);
          if (cData.length > 0) setSelectedCharity(cData[0]._id);
        }

        // Check time
        checkTimeStatus(tData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 2. Check Start Time Logic
  const checkTimeStatus = (t) => {
    const now = new Date();
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);

    if (now < start) {
      setCanJoin(false);
      setTimeMessage(`Starts on ${start.toLocaleDateString()} at ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`);
    } else if (now > end) {
      setCanJoin(false);
      setTimeMessage('Tournament Ended');
    } else {
      setCanJoin(true);
      setTimeMessage('Tournament Active! Join Now.');
    }
  };

  const handleJoinClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // If already joined, just go to play
    if (isJoined) {
      navigate(`/play/${id}`);
      return;
    }

    if (canJoin) {
      // If free, join directly
      if (tournament.entryFee === 0) {
        confirmJoin();
      } else {
        // If not joined but fee > 0, assume they missed homepage payment or link
        // Show modal to pay
        setShowCharityModal(true);
      }
    }
  };

  const confirmJoin = async () => {
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/tournaments/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id || user._id, // Handle both id formats
          charityId: selectedCharity || null
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setShowCharityModal(false);
        navigate(`/play/${id}`);
      } else {
        setJoinError(data.message || 'Failed to join');
      }
    } catch (err) {
      setJoinError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading tournament details...</div>;
  if (!tournament) return <div>Tournament not found (ID: {id})</div>;

  return (
    <div className="tournament-detail-page">
      
      {/* Hero Section */}
      <div className="detail-hero">
        <div className="detail-hero-content">
          <div className="hero-text-col">
            <div className="breadcrumb">
              <Link to="/" style={{ color: '#C0C4FC', textDecoration: 'none' }}>Home</Link>
              <span className="chevron">▶</span>
              <span>Tournaments</span>
            </div>
            
            <h1 className="detail-title">{tournament.title}</h1>
            <p className="detail-subtitle">{tournament.description}</p>
            
            <div className="detail-meta">
              <span className="bestseller-badge">{tournament.status}</span>
              <span className="rating-score">Difficulty: {tournament.difficulty}</span>
              <span className="students-count">{tournament.participants ? tournament.participants.length : 0} participants</span>
            </div>

            <div className="organizer-info">
              Schedule: {new Date(tournament.startDate).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })} - {new Date(tournament.endDate).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar / CTA Area */}
      <div className="detail-sidebar-wrapper">
        <div className="sidebar-card">
          <div className="detail-price">
            {tournament.entryFee > 0 ? `${tournament.entryFee}` : 'Free'}
            <span className="donation-badge">Entry</span>
          </div>

          <div style={{ marginBottom: '16px', fontWeight: 'bold', color: canJoin ? '#1F7A4D' : '#D32F2F' }}>
            {timeMessage}
          </div>

          <button 
            className="join-btn" 
            onClick={handleJoinClick}
            disabled={!canJoin && !isJoined}
            style={{ opacity: (canJoin || isJoined) ? 1 : 0.6, cursor: (canJoin || isJoined) ? 'pointer' : 'not-allowed' }}
          >
            {isJoined ? 'Enter Arena' : (canJoin ? 'Participate Now' : 'Not Available')}
          </button>
          
          <div className="money-back-text">Compete & Rank Up</div>

          <div className="sidebar-list">
            <h4>Rules:</h4>
            <ul>
              <li>✓ Type accurately</li>
              <li>✓ Speed matters</li>
              <li>✓ No cheating</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="detail-body">
        <div className="body-left-col">
          
          {/* Leaderboard Section */}
          <div className="leaderboard-preview" style={{ marginTop: 0 }}>
            <h2 className="section-title">Contest Leaderboard</h2>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <div key={index} className="leaderboard-row">
                  <span style={{ fontWeight: 'bold', width: '30px' }}>#{index + 1}</span>
                  <span style={{ flex: 1 }}>{entry.username || entry.userId}</span>
                  <span style={{ width: '100px' }}>{entry.wpm} WPM</span>
                  <span style={{ width: '80px' }}>{entry.accuracy}%</span>
                  <span style={{ fontWeight: 'bold', color: '#A435F0' }}>{entry.score} pts</span>
                </div>
              ))
            ) : (
              <p>No results yet. Be the first to join!</p>
            )}
          </div>

          <div className="course-description">
            <h2 className="section-title">Description</h2>
            <p className="description-text">{tournament.description}</p>
          </div>

        </div>
      </div>

      {/* Charity Selection Modal */}
      {showCharityModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div className="modal-content" style={{
            background: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '500px'
          }}>
            <h2>Select a Charity Cause</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Part of your entry fee will be donated to the cause you select.
            </p>

            {joinError && <div style={{ color: 'red', marginBottom: '15px' }}>{joinError}</div>}

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Choose Cause:</label>
              <select 
                value={selectedCharity} 
                onChange={(e) => setSelectedCharity(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                {charities.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>

            {selectedCharity && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{charities.find(c => c._id === selectedCharity)?.title}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                  {charities.find(c => c._id === selectedCharity)?.description.substring(0, 100)}...
                </p>
              </div>
            )}

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowCharityModal(false)}
                style={{ padding: '10px 20px', border: '1px solid #ccc', background: 'white', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmJoin}
                disabled={joining}
                style={{ padding: '10px 20px', background: '#A435F0', color: 'white', border: 'none', borderRadius: '4px', cursor: joining ? 'wait' : 'pointer' }}
              >
                {joining ? 'Processing...' : `Pay ${tournament.entryFee} & Join`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetail;
