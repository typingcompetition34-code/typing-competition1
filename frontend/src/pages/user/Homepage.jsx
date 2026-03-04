import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import '../../styles/Homepage.css';
import frontpageImg from '../../assets/front.png';
import DonationModal from '../../components/DonationModal';
import PaymentModal from '../../components/PaymentModal';

const Homepage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const contestsRef = useRef(null);
  
  const [tournaments, setTournaments] = useState([]);
  const [charities, setCharities] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const initialContestTab = location.state?.contestTab || 'All';
  const [contestTab, setContestTab] = useState(initialContestTab); // 'All', 'Live', 'Upcoming'
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const API_URL = `${API_BASE_URL}/api/tournaments?type=user`;

  useEffect(() => {
    if (location.state?.scrollToContests && contestsRef.current) {
      contestsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (location.state?.contestTab) {
      setContestTab(location.state.contestTab);
    }
  }, [location.state]);

  useEffect(() => {
    const run = async () => {
      try {
        const [tRes, cRes, lRes] = await Promise.all([
          fetch(API_URL),
          fetch(`${API_BASE_URL}/api/charities?status=active`),
          fetch(`${API_BASE_URL}/api/tournaments/leaderboard/global`)
        ]);

        if (tRes.ok) {
          const data = await tRes.json();
          const mappedData = data
            .filter((item) => item._id)
            .map((item) => ({
              id: item._id,
              title: item.title,
              author: 'Charity Typing Org',
              description: item.description,
              category: item.category || 'General',
              entryFee: item.entryFee,
              status: item.status,
              startDate: item.startDate,
              endDate: item.endDate,
              tournamentId: item.tournamentId,
              difficulty: item.difficulty,
              maxParticipants: item.maxParticipants,
              participantsCount: item.participants ? item.participants.length : 0,
              impactScore: Math.floor(Math.random() * 5000) + 1000,
              rating: (4.5 + Math.random() * 0.5).toFixed(1),
              ratingCount: Math.floor(Math.random() * 1000) + 50
            }));
          setTournaments(mappedData);
        }

        if (cRes.ok) {
          const data = await cRes.json();
          setCharities(data);
        }

        if (lRes.ok) {
          const data = await lRes.json();
          setGlobalLeaderboard(data);
        }
      } catch (error) {
        console.error('Error loading homepage data:', error);
      }
    };

    void run();
  }, [API_URL]);

  const filteredTournaments = (() => {
    if (contestTab === 'All') {
      return tournaments.filter(t => t.status === 'active' || t.status === 'upcoming' || t.status === 'ended');
    }
    return contestTab === 'Live' 
      ? tournaments.filter(t => t.status === 'active') 
      : tournaments.filter(t => t.status === 'upcoming');
  })();

  const handleJoinClick = async (tournament) => {
    // 0. Check for slots
    const slotsLeft = Math.max(0, (tournament.maxParticipants || 100) - (tournament.participantsCount || 0));
    if (slotsLeft <= 0 && tournament.status !== 'ended') {
        alert('This tournament is full.');
        return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    // 1. If Free -> Go directly
    if (tournament.entryFee === 0) {
        navigate(`/tournament/${tournament.id}`);
        return;
    }

    // 2. Check Payment Status
    try {
        const res = await fetch(`${API_BASE_URL}/api/payments/check/${tournament.id}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (res.ok) {
            const data = await res.json();
            if (data.status === 'approved') {
                navigate(`/tournament/${tournament.id}`);
            } else if (data.status === 'pending') {
                alert('Your payment is pending approval.');
            } else {
                // 'none' or 'rejected'
                setSelectedTournament(tournament);
                setShowPaymentModal(true);
            }
        } else {
             // Fallback
             setSelectedTournament(tournament);
             setShowPaymentModal(true);
        }
    } catch (err) {
        console.error("Payment check error:", err);
        setSelectedTournament(tournament);
        setShowPaymentModal(true);
    }
  };

  const handlePaymentSubmit = async ({ tournamentId, charityId, amount }) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/payments/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                tournamentId,
                charityId,
                amount
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Payment successful! You can now join the tournament.');
            setShowPaymentModal(false);
            // Refresh logic might be needed, or redirect
            navigate(`/tournament/${tournamentId}`);
        } else {
            alert(data.message || 'Payment failed');
        }
    } catch (err) {
        console.error('Submission error:', err);
        alert('Error submitting payment: ' + err.message);
    }
  };

  const handleDonateClick = (charity) => {
    console.log('Donate clicked for:', charity);
    if (!user) {
      console.log('User not logged in, redirecting...');
      navigate('/login');
      return;
    }
    setSelectedCharity(charity);
    setShowDonationModal(true);
  };

  const handleDonationSubmit = async () => {
    // Refresh charities to show updated raised amount
    try {
        const cRes = await fetch(`${API_BASE_URL}/api/charities?status=active`);
        if (cRes.ok) {
          const data = await cRes.json();
          setCharities(data);
        }
        setShowDonationModal(false);
    } catch (err) {
        console.error('Error refreshing charities:', err);
    }
  };

  return (
    <div className="homepage-wrapper">
      {showPaymentModal && selectedTournament && (
        <PaymentModal 
          isOpen={true}
          tournament={selectedTournament}
          charities={charities}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePaymentSubmit}
        />
      )}
      {showDonationModal && selectedCharity && (
        <DonationModal
          isOpen={true}
          charity={selectedCharity}
          onClose={() => setShowDonationModal(false)}
          onSubmit={handleDonationSubmit}
        />
      )}
      {/* Hero Section */}
      <section className="hero-section" style={{backgroundImage: `url(${frontpageImg})`}}>
        <div className="hero-content">
          <div className="hero-text">
          </div>
        </div>
      </section>
      
      {/* Mobile Hero Image */}
      <img src={frontpageImg} alt="Hero Banner" className="mobile-hero-img" />

      <div className="main-content-wrapper">
        
        {/* 1. Contests Section */}
        <section className="section-container contests-section" ref={contestsRef}>
          <div className="contests-header-wrapper">
            <div className="section-content-inner">
              <div className="contest-tabs">
                <button 
                  className={`tab-header ${contestTab === 'All' ? 'active' : ''}`}
                  onClick={() => setContestTab('All')}
                >
                  All Contests
                </button>
                <button 
                  className={`tab-header ${contestTab === 'Live' ? 'active' : ''}`}
                  onClick={() => setContestTab('Live')}
                >
                  Live Contests
                </button>
                <button 
                  className={`tab-header ${contestTab === 'Upcoming' ? 'active' : ''}`}
                  onClick={() => setContestTab('Upcoming')}
                >
                  Upcoming Contests
                </button>
              </div>
            </div>
          </div>

          <div className="section-content-inner">
            <div className="contest-list">
            {filteredTournaments.length > 0 ? (
              filteredTournaments.map(t => (
                <div key={t.id} className="contest-card">
                  <div className="contest-info">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h3>{t.title}</h3>
                        <span style={{fontSize: '12px', color: '#666', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px'}}>ID: {t.tournamentId}</span>
                    </div>
                    <p className="contest-meta">
                      {t.status === 'active' ? 'Live Now' : t.status === 'upcoming' ? 'Upcoming' : 'Ended'}
                      <span className={`status-badge ${t.status === 'active' ? 'status-live' : 'status-upcoming'}`} 
                            style={{marginLeft: '10px', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: t.status==='active'?'#e8f5e9':'#fff3e0', color: t.status==='active'?'#2e7d32':'#ef6c00'}}>
                        {t.status.toUpperCase()}
                      </span>
                    </p>
                    <div className="contest-time" style={{fontSize: '12px', color: '#444', marginBottom: '8px', fontWeight: '500', display: 'flex', flexDirection: 'column', gap: '2px'}}>
                        <div><span style={{color: '#888'}}>Start:</span> {new Date(t.startDate).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                        <div><span style={{color: '#888'}}>End:</span> {new Date(t.endDate).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                    </div>
                    <div className="contest-details" style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px'}}>
                      <span className="difficulty-badge" style={{background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px'}}>
                        Difficulty: {t.difficulty || 'Medium'}
                      </span>
                      <span className="participants-count" style={{fontSize: '12px', color: '#666'}}>
                        Max: {t.maxParticipants}
                      </span>
                      <span className="slots-available" style={{fontSize: '12px', color: '#2e7d32', fontWeight: 'bold'}}>
                        Slots Left: {Math.max(0, (t.maxParticipants || 100) - (t.participantsCount || 0))}
                      </span>
                    </div>
                  </div>
                  <div className="contest-action">
                    <button 
                        onClick={() => handleJoinClick(t)} 
                        className="btn-join-now"
                        disabled={Math.max(0, (t.maxParticipants || 100) - (t.participantsCount || 0)) <= 0 && t.status !== 'ended'}
                        style={Math.max(0, (t.maxParticipants || 100) - (t.participantsCount || 0)) <= 0 && t.status !== 'ended' ? { background: '#ccc', cursor: 'not-allowed' } : {}}
                    >
                        {Math.max(0, (t.maxParticipants || 100) - (t.participantsCount || 0)) <= 0 && t.status !== 'ended' 
                            ? 'Full' 
                            : (t.status === 'active' ? 'Join Now' : t.status === 'upcoming' ? 'Register' : 'View')}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No {contestTab.toLowerCase()} contests available at the moment.</div>
            )}
          </div>
          </div>
        </section>

        {/* 2. Charity Campaigns Section */}
        <section className="section-container gradient-band">
          <div className="section-content-inner">
            <div className="section-header-simple">
          <h2>Charity Campaigns</h2>
          <p style={{marginTop: '8px', color: '#333'}}>Support these causes while you type. Watch their stories below.</p>
        </div>
          
          <div className="charity-grid">
            {charities.length > 0 ? (
              charities.map(charity => (
                <div key={charity._id} className="charity-card-new">
                  {charity.videoUrl && (
                    <div className="charity-video-wrapper" style={{marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', background: '#000'}}>
                      <video controls width="100%" height="200" style={{display: 'block'}}>
                        <source src={`${API_BASE_URL}${charity.videoUrl}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  
                  <h3>{charity.title}</h3>
                  
                  <div className="charity-story" style={{marginBottom: '20px'}}>
                    <h4 style={{fontSize: '14px', marginBottom: '8px', color: '#444'}}>Our Story:</h4>
                    <p className="charity-desc" style={{whiteSpace: 'pre-wrap'}}>{charity.description}</p>
                  </div>
                  
                  <div className="charity-progress-section">
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                      <span style={{fontSize: '12px', fontWeight: 'bold', color: '#A020F0'}}>Live Progress</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${Math.min((charity.raisedAmount / charity.goalAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="progress-labels">
                      <span>Raised: {charity.raisedAmount.toLocaleString()}</span>
                      <span>Goal: {charity.goalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <button className="btn-donate-black" onClick={() => handleDonateClick(charity)}>Donate</button>
                </div>
              ))
            ) : (
              <p>No active charity campaigns.</p>
            )}
          </div>
          </div>
        </section>

        {/* 3. Global Leaderboard Section (Typing Competitions Style) */}
        <div className="typing-competitions-section">
          <div className="section-content-inner">
            <h2 className="competitions-title">Typing Competitions</h2>
            <div className="leaderboard-card">
              <div className="leaderboard-header">
                <div className="header-item rank">#</div>
                <div className="header-item user">User</div>
                <div className="header-item wpm">WPM</div>
                <div className="header-item accuracy">Accuracy</div>
                <div className="header-item score">Score</div>
              </div>
              
              <div className="leaderboard-rows">
                {globalLeaderboard.length > 0 ? (
                  globalLeaderboard.map((user, index) => (
                    <div key={user.userId || index} className="leaderboard-row">
                      <div className="row-item rank" data-label="Rank">#{index + 1}</div>
                      <div className="row-item user" data-label="Player">
                        <div className="user-info-wrapper">
                          <div className="leaderboard-user-name">{user.username || user.userId}</div>
                        </div>
                      </div>
                      <div className="row-item wpm" data-label="WPM">{user.wpm}</div>
                      <div className="row-item accuracy" data-label="Accuracy">{user.accuracy}%</div>
                      <div className="row-item score" data-label="Score">{user.score}</div>
                    </div>
                  ))
                ) : (
                  <div className="leaderboard-row empty">
                    <div className="row-item">
                      No active competitors yet.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Homepage;
