import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import '../../styles/UserDashboard.css';
import '../../styles/Homepage.css'; // Import Homepage styles if needed for reused classes
import OneToOneContestModal from '../../components/OneToOneContestModal';
import dashboardImg from '../../assets/dashboard.jpeg';

const UserDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardData');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(!data);
  const [activeTab, setActiveTab] = useState('practice'); 
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemReason, setRedeemReason] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  // Deposit States
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [depositMsg, setDepositMsg] = useState('');
  const [depositHistory, setDepositHistory] = useState([]);
  
  // Contest States
  const [invitations, setInvitations] = useState([]);
  const [myContests, setMyContests] = useState([]);
  const [contestsFetchedOnce, setContestsFetchedOnce] = useState(false);

  // Financial Data
  const [transactions, setTransactions] = useState([]);
  const [redeemRequests, setRedeemRequests] = useState([]);

  // Counts
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unseenInvitations, setUnseenInvitations] = useState(0);
  const countsVersionRef = useRef(0);

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showOneToOneModal, setShowOneToOneModal] = useState(false);
  const [selectedInviteId, setSelectedInviteId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Toggle States for Forms
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showRedeemForm, setShowRedeemForm] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
        fetchDashboardData();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!socket) return;

    const handleNewInvitation = (newContest) => {
      if (newContest && newContest.status === 'Pending') {
          const newId = String(newContest?._id || '');
          setInvitations((prev) => {
            if (!newId) return prev;
            if (prev.some((c) => String(c?._id || '') === newId)) return prev;
            return [newContest, ...prev];
          });
          countsVersionRef.current += 1;
          setUnseenInvitations((prev) => prev + 1);
      }
    };

    socket.on('invitation:new', handleNewInvitation);

    return () => {
      socket.off('invitation:new', handleNewInvitation);
    };
  }, [socket]);

  const fetchCounts = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const version = countsVersionRef.current;

        const [notifRes, inviteRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/notifications/unread-count`, { headers: { 'x-auth-token': token } }),
          fetch(`${API_BASE_URL}/api/one-to-one/unseen-invitations-count`, { headers: { 'x-auth-token': token } })
        ]);

        const nextUnread = notifRes.ok ? (await notifRes.json()).count : null;
        const nextUnseen = inviteRes.ok ? (await inviteRes.json()).count : null;

        if (version !== countsVersionRef.current) return;

        if (typeof nextUnread === 'number') setUnreadNotifications(nextUnread);
        if (typeof nextUnseen === 'number') setUnseenInvitations(nextUnseen);

    } catch (err) {
        console.error("Error fetching counts:", err);
    }
  };

  const handleNotificationTabClick = async () => {
    setActiveTab('notifications');
    if (unreadNotifications > 0) {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
                method: 'PUT',
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            countsVersionRef.current += 1;
            setUnreadNotifications(0);
        } catch (err) { console.error(err); }
    }
  };

  const handleInvitationTabClick = async () => {
    setActiveTab('invitations');
    if (unseenInvitations > 0) {
        try {
            await fetch(`${API_BASE_URL}/api/one-to-one/mark-invitations-seen`, {
                method: 'PUT',
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            countsVersionRef.current += 1;
            setUnseenInvitations(0);
        } catch (err) { console.error(err); }
    }
  };

  useEffect(() => {
    if (!user) return;

    if (activeTab === 'notifications') {
        fetchNotifications();
    } else if (activeTab === 'financials') {
        fetchFinancials();
    } else if (activeTab === 'my_contests' || activeTab === 'invitations') {
        fetchContests();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (!socket) return;

    const handleContestAccepted = (data) => {
        console.log('Contest accepted socket event received:', data);
        fetchDashboardData();
        fetchContests();
        fetchNotifications();
        fetchCounts();
    };

    socket.on('contest:accepted', handleContestAccepted);

    return () => {
        socket.off('contest:accepted', handleContestAccepted);
    };
  }, [socket]);

  const fetchFinancials = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/user/financials`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        if (res.ok) {
            const data = await res.json();
            setTransactions(data.transactions);
            setRedeemRequests(data.redeemRequests);
            setDepositHistory(data.depositHistory);
            setPaymentMethods(data.paymentMethods);
            if (data.paymentMethods.length > 0 && !selectedMethod) {
                setSelectedMethod(data.paymentMethods[0]._id);
            }
        }
    } catch (err) {
        console.error("Error fetching financials:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/transactions/my`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const data = await res.json();
        setTransactions(data);
    } catch (err) {
        console.error(err);
    }
  };

  const fetchRedeemRequests = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/redeem`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const data = await res.json();
        setRedeemRequests(data);
    } catch (err) {
        console.error(err);
    }
  };

  const fetchContests = async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
         console.log("Waiting for user ID...");
         return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/one-to-one/my-contests`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const data = await res.json();
        
        if (!Array.isArray(data)) {
             console.error('Expected array of contests, got:', data);
             return;
        }

        const currentUserId = String(userId);
        const getUserId = (value) => String(value?._id || value || '');

        const pendingReceived = data.filter((c) => {
          if (c.status !== 'Pending') return false;
          return getUserId(c.opponent) === currentUserId && getUserId(c.challenger) !== currentUserId;
        });
        setInvitations(pendingReceived);

        const my = data.filter((c) => {
          if (c.status !== 'Pending') return true;
          return getUserId(c.opponent) !== currentUserId;
        });
        setMyContests(my);
    } catch (err) {
        console.error("Error fetching contests:", err);
    } finally {
        setContestsFetchedOnce(true);
    }
  };

  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
          }).toUpperCase();
      } catch (e) {
          return 'Invalid Date';
      }
  };

  const handleContestAction = async (id, action) => {
    if (action === 'reject') {
        setSelectedInviteId(id);
        setShowRejectModal(true);
        return;
    }

    if (action === 'accept') {
        // Optimistic UI Update: Remove from invitations immediately
        setInvitations(prev => prev.filter(i => i._id !== id));
        setUnseenInvitations(prev => Math.max(0, prev - 1));
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/one-to-one/${action}/${id}`, {
            method: 'PUT',
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        if (res.ok) {
            // Background refresh - don't block UI
            Promise.all([
                fetchContests(),
                fetchCounts(),
                fetchNotifications(),
                fetchDashboardData()
            ]).catch(console.error);
        } else {
            const err = await res.json();
            alert(err.message);
            // Revert on error
            if (action === 'accept') {
                fetchContests(); 
                fetchCounts();
            }
        }
    } catch (err) {
        console.error(err);
        // Revert on error
        if (action === 'accept') {
            fetchContests();
            fetchCounts();
        }
    }
  };

  const handleRejectClick = (id) => handleContestAction(id, 'reject');
  const handleAcceptInvite = (id) => handleContestAction(id, 'accept');

  const submitRejection = async () => {
    if (!rejectReason) {
        alert('Please provide a reason for rejection.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/one-to-one/reject/${selectedInviteId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') 
            },
            body: JSON.stringify({ reason: rejectReason })
        });

        if (res.ok) {
            fetchDashboardData();
            fetchCounts(); // Refresh badges
            fetchNotifications(); // Refresh notifications
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedInviteId(null);
            alert('Invitation rejected.');
        } else {
            const err = await res.json();
            alert(err.message);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/notifications`, {
            headers: {
                'x-auth-token': token
            }
        });
        if (res.ok) {
            const data = await res.json();
            setNotifications(data);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payment-methods`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();
      setPaymentMethods(data);
      if (data.length > 0) setSelectedMethod(data[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepositHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/my-history`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();
      // Filter only wallet_deposit types
      setDepositHistory(data.filter(d => d.type === 'wallet_deposit'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const version = countsVersionRef.current;

      const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setData(result);
        localStorage.setItem('dashboardData', JSON.stringify(result));
        if (result.counts && version === countsVersionRef.current) {
          setUnreadNotifications(result.counts.unreadNotifications || 0);
          setUnseenInvitations(result.counts.unseenInvitations || 0);
        }
        if (Array.isArray(result.oneToOneContests)) {
            const userId = user?.id || user?._id;
            const currentUserId = String(userId || '');
            const getUserId = (value) => String(value?._id || value || '');

            const pendingReceived = result.oneToOneContests.filter((c) => {
              if (c.status !== 'Pending') return false;
              return getUserId(c.opponent) === currentUserId && getUserId(c.challenger) !== currentUserId;
            });
            setInvitations((prev) => {
              const isPendingReceived = (c) => {
                if (!c || c.status !== 'Pending') return false;
                return getUserId(c.opponent) === currentUserId && getUserId(c.challenger) !== currentUserId;
              };

              const filteredPrev = Array.isArray(prev) ? prev.filter(isPendingReceived) : [];
              const merged = new Map();
              [...filteredPrev, ...pendingReceived].forEach((c) => {
                const id = String(c?._id || '');
                if (id) merged.set(id, c);
              });
              return Array.from(merged.values()).sort((a, b) => {
                const aTime = new Date(a?.createdAt || a?.scheduledTime || 0).getTime();
                const bTime = new Date(b?.createdAt || b?.scheduledTime || 0).getTime();
                return bTime - aTime;
              });
            });

            const my = result.oneToOneContests.filter((c) => {
              if (c.status !== 'Pending') return true;
              return getUserId(c.opponent) !== currentUserId;
            });
            setMyContests(my);
            setContestsFetchedOnce(true);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ amount: Number(redeemAmount), reason: redeemReason })
      });
      
      if (response.ok) {
        setRedeemMsg('Request submitted successfully!');
        setRedeemAmount('');
        setRedeemReason('');
        fetchDashboardData(); // Refresh list
        fetchRedeemRequests(); // Refresh redeem history
      } else {
        const err = await response.json();
        setRedeemMsg(`Error: ${err.message}`);
      }
    } catch (err) {
      setRedeemMsg('Failed to submit request.');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositMsg('');

    if (!receiptFile) {
        setDepositMsg('Please upload a receipt.');
        return;
    }

    const formData = new FormData();
    formData.append('amount', depositAmount);
    formData.append('paymentMethodId', selectedMethod);
    formData.append('receipt', receiptFile);

    try {
        const res = await fetch(`${API_BASE_URL}/api/payments/deposit`, {
            method: 'POST',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            },
            body: formData
        });

        if (res.ok) {
            setDepositMsg('Deposit request submitted successfully! Pending approval.');
            setDepositAmount('');
            setReceiptFile(null);
            fetchDepositHistory(); // Refresh history
        } else {
            const data = await res.json();
            setDepositMsg(data.message || 'Error submitting deposit.');
        }
    } catch (err) {
        console.error(err);
        setDepositMsg('Server Error.');
    }
  };

  if (loading && !data) {
    // Show a skeleton or at least the top bar if user is available
    // For now, we will render the structure with loading placeholders
  }
  
  // if (!data) return <div className="error">Failed to load data.</div>; // Move this check inside

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-top-bar">
        <div className="welcome-container">
          <h1 className="welcome-text-top">Welcome, {user?.username?.toUpperCase()}</h1>
          <span className="user-id-badge">ID: {data?.user?.uniqueKey || 'Loading...'}</span>
        </div>
      </div>
      <section className="dashboard-hero">
        <div className="hero-bg-image" style={{backgroundImage: `url(${dashboardImg})`}}></div>
        <div className="hero-content">
          <div className="overview-stats-hero">
            <div className="wallet-card-hero">
              <span>Wallet Balance</span>
              <h2>{data?.user?.walletBalance !== undefined ? data.user.walletBalance : '...'}</h2> 
            </div>
            <div className="stat-card-hero">
              <p>Redeem Requests</p>
              <h3>{data?.stats?.totalRedeemRequests !== undefined ? data.stats.totalRedeemRequests : (data?.redeemRequests?.length || '...')}</h3>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', display: 'none' }}>
            {/* Moved button to nav bar */}
          </div>
        </div>
      </section>

      <div className="dashboard-container" style={{minHeight: '60vh', marginTop: '20px'}}>
      
      <div className="dashboard-nav" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="nav-tabs" style={{display: 'flex', gap: '10px', overflowX: 'auto'}}>
            <button className={activeTab === 'practice' ? 'active' : ''} onClick={() => setActiveTab('practice')}>Practice History</button>
            <button className={activeTab === 'financials' ? 'active' : ''} onClick={() => setActiveTab('financials')}>Financials & Redeem</button>
            <button className={activeTab === 'notifications' ? 'active' : ''} onClick={handleNotificationTabClick}>
                Notifications
                {unreadNotifications > 0 && (
                    <span style={{
                        marginLeft: '5px',
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>{unreadNotifications}</span>
                )}
            </button>
            <button className={activeTab === 'invitations' ? 'active' : ''} onClick={handleInvitationTabClick}>
                Invitations
                {unseenInvitations > 0 && (
                    <span style={{
                        marginLeft: '5px',
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>{unseenInvitations}</span>
                )}
            </button>
            <button className={activeTab === 'my_contests' ? 'active' : ''} onClick={() => setActiveTab('my_contests')}>My Contests</button>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => navigate('/one-to-one-contest')}
          style={{ 
            background: 'linear-gradient(to right, #bc4e9c, #f80759)', 
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap'
          }}
        >
          ONE TO ONE TYPING CONTEST
        </button>
      </div>

      <div className="dashboard-content">
        {loading && !data && <div style={{padding: '20px', textAlign: 'center'}}>Loading data...</div>}

        {/* Rejection Modal */}
        {showRejectModal && (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '10px',
                    width: '90%',
                    maxWidth: '400px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}>
                    <h3>Reject Invitation</h3>
                    <p style={{marginBottom: '10px'}}>Please provide a reason for rejecting this contest:</p>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g., Busy, Not interested, Skill mismatch..."
                        style={{
                            width: '100%',
                            height: '100px',
                            padding: '10px',
                            marginBottom: '20px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button 
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectReason('');
                                setSelectedInviteId(null);
                            }}
                            style={{
                                padding: '8px 15px',
                                border: 'none',
                                background: '#eee',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={submitRejection}
                            style={{
                                padding: '8px 15px',
                                border: 'none',
                                background: '#e74c3c',
                                color: 'white',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Reject Invitation
                        </button>
                    </div>
                </div>
            </div>
        )}

        {showOneToOneModal && (
                <OneToOneContestModal 
                    onClose={() => setShowOneToOneModal(false)} 
                    onSuccess={() => {
                        fetchContests();
                        setShowOneToOneModal(false);
                        alert('Contest request sent!');
                    }} 
                />
            )}

        {activeTab === 'practice' && (
          <div className="table-container">
            <h3>Practice History</h3>
            {!data ? (
                <div style={{padding: '20px', textAlign: 'center'}}>Loading history...</div>
            ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Level</th>
                  <th>WPM</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {(data.practiceResults || []).map((res) => (
                  <tr key={res._id}>
                    <td>{new Date(res.date).toLocaleDateString()}</td>
                    <td>{res.level}</td>
                    <td>{res.wpm}</td>
                    <td>{res.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="financials-section">
            
            <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px'}}>
                {/* Deposit Section */}
                <div className="redeem-box" style={{flex: 1, minWidth: '300px', borderLeft: '4px solid #4CAF50'}}>
                    <div 
                        style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}} 
                        onClick={() => setShowDepositForm(!showDepositForm)}
                    >
                        <h3>Deposit Money</h3>
                        <span>{showDepositForm ? '▲' : '▼'}</span>
                    </div>
                    
                    {showDepositForm && (
                    <form onSubmit={handleDeposit} style={{marginTop: '15px'}}>
                        <div style={{marginBottom: '15px'}}>
                            <label style={{display:'block', marginBottom:'5px'}}>Amount</label>
                            <input
                                type="number"
                                placeholder="Enter Amount"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                min="1"
                                required
                                style={{width: '100%', padding: '8px'}}
                            />
                        </div>
                        
                        <div style={{marginBottom: '15px'}}>
                            <label style={{display:'block', marginBottom:'5px'}}>Select Payment Method</label>
                            <select 
                                value={selectedMethod} 
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                required
                                style={{width: '100%', padding: '8px'}}
                            >
                                <option value="">Select Method</option>
                                {paymentMethods.map(method => (
                                    <option key={method._id} value={method._id}>
                                        {method.title} ({method.details})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{marginBottom: '15px'}}>
                            <label style={{display:'block', marginBottom:'5px'}}>Upload Receipt (Screenshot)</label>
                            <input 
                                type="file" 
                                onChange={(e) => setReceiptFile(e.target.files[0])}
                                accept="image/*"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{backgroundColor: '#4CAF50'}}>Submit Deposit</button>
                    </form>
                    )}
                    {depositMsg && <p className="msg">{depositMsg}</p>}
                </div>

                {/* Redeem Section */}
                <div className="redeem-box" style={{flex: 1, minWidth: '300px'}}>
                <div 
                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}} 
                    onClick={() => setShowRedeemForm(!showRedeemForm)}
                >
                    <h3>Request Redeem</h3>
                    <span>{showRedeemForm ? '▲' : '▼'}</span>
                </div>
                
                {showRedeemForm && (
                <form onSubmit={handleRedeem} style={{marginTop: '15px'}}>
                    <input
                    type="number"
                    placeholder="Amount"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    min="1"
                    required
                    />
                    <textarea
                    placeholder="Reason for Redeem (e.g., Bank details, Urgent need)"
                    value={redeemReason}
                    onChange={(e) => setRedeemReason(e.target.value)}
                    required
                    style={{width: '100%', padding: '10px', marginTop: '10px', minHeight: '60px'}}
                    />
                    <button type="submit" className="btn-primary" style={{marginTop: '10px'}}>Submit Request</button>
                </form>
                )}
                {redeemMsg && <p className="msg">{redeemMsg}</p>}
                </div>
            </div>

            <div className="transactions-list">
              <h3>All Transactions</h3>
              {!data ? (
                <div>Loading transactions...</div>
              ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...(depositHistory || []).map(d => ({
                      _id: d._id,
                      date: d.createdAt,
                      type: 'Deposit',
                      amount: d.amount,
                      status: d.status
                    })),
                    ...(redeemRequests || []).map(r => ({
                      _id: r._id,
                      date: r.requestDate,
                      type: 'Redeem',
                      amount: r.amount,
                      status: r.status // Use status from RedeemRequest
                    })),
                    ...(transactions || []).filter(t => t.type !== 'Deposit' && t.type !== 'Withdrawal' && t.type !== 'Redeem').map(t => ({ // Filter out duplicates if transaction list includes deposits/withdrawals/redeem
                      _id: t._id,
                      date: t.date,
                      type: t.type,
                      amount: t.amount,
                      status: t.status || 'Completed'
                    }))
                  ].sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => (
                    <tr key={item._id}>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.type}</td>
                      <td>{(Number(item.amount) || 0).toFixed(2)}</td>
                      <td>
                        <span className={`status ${item.status?.toLowerCase()}`}>
                            {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
            <div className="notifications-list">
                <h3>Notifications</h3>
                {notifications.length > 0 ? (
                    notifications.map(note => (
                        <div key={note._id} className={`notification-item ${note.type}`} style={{padding: '15px', borderBottom: '1px solid #eee', background: note.type==='success'?'#e8f5e9':note.type==='error'?'#ffebee':'#fff'}}>
                            <p style={{margin: 0, fontWeight: '500'}}>{note.message}</p>
                            <small style={{color: '#888'}}>{formatDate(note.createdAt)}</small>
                        </div>
                    ))
                ) : (
                    <p>No notifications.</p>
                )}
            </div>
        )}

        {activeTab === 'invitations' && (
            <div className="invitations-list">
                <h3>Contest Invitations</h3>
                {!contestsFetchedOnce ? null : invitations.length > 0 ? (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {invitations.map(invite => (
                            <div key={invite._id} style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '10px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                border: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '15px'
                            }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>Challenger: {invite.challenger?.username || 'Unknown User'}</h4>
                                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                                        Type: {invite.contestType || 'N/A'} | Mode: {invite.contestMode || 'N/A'}
                                        {invite.contestMode === 'Paid Contest' && ` | Fee: ${invite.entryFee || 0}`}
                                    </p>
                                    <small style={{ color: '#888' }}>
                                        Scheduled: {formatDate(invite.scheduledTime)}
                                    </small>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => handleRejectClick(invite._id)}
                                        style={{
                                            padding: '8px 15px',
                                            border: '1px solid #ff4d4f',
                                            background: 'white',
                                            color: '#ff4d4f',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleAcceptInvite(invite._id)}
                                        style={{
                                            padding: '8px 15px',
                                            border: 'none',
                                            background: '#52c41a',
                                            color: 'white',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Accept
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No pending invitations.</p>
                )}
            </div>
        )}

        {activeTab === 'my_contests' && (
            <div className="table-container">
                <h3>My Contests</h3>
                {!contestsFetchedOnce ? null : myContests.length === 0 ? (
                    <p>No contests found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Opponent/Challenger</th>
                                <th>Type</th>
                                <th>Mode</th>
                                <th>Status</th>
                                <th>Scheduled Time</th>
                                <th>Winner</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myContests.map(contest => {
                                const userId = user?.id || user?._id;
                                if (!userId) return null;
                                const isChallenger = contest.challenger?._id === userId || contest.challenger === userId;
                                const otherUser = isChallenger ? contest.opponent : contest.challenger;
                                return (
                                    <tr key={contest._id}>
                                        <td>{otherUser?.username ? `${otherUser.username} (${otherUser.uniqueKey})` : 'Unknown'}</td>
                                        <td>{contest.contestType || 'N/A'}</td>
                                        <td>{contest.contestMode || 'N/A'}</td>
                                        <td>
                                            <span 
                                                className={`status ${contest.status?.toLowerCase() || 'pending'}`}
                                                title={contest.status === 'Rejected' && contest.rejectionReason ? `Reason: ${contest.rejectionReason}` : ''}
                                                style={{ cursor: contest.status === 'Rejected' ? 'help' : 'default' }}
                                            >
                                                {contest.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td>{formatDate(contest.scheduledTime)}</td>
                                        <td>{contest.winner ? (contest.winner === userId ? 'You' : 'Opponent') : '-'}</td>
                                        <td>
                                            <button
                                                onClick={() => {
                                                    try {
                                                        localStorage.setItem(`contest_${contest._id}`, JSON.stringify(contest));
                                                    } catch (e) {}
                                                    navigate(`/one-to-one/play/${contest._id}`, { state: { contest } });
                                                }}
                                                disabled={contest.status !== 'Accepted'}
                                                style={{
                                                    padding: '5px 10px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    background: contest.status === 'Accepted' ? '#A435F0' : '#ccc',
                                                    color: 'white',
                                                    cursor: contest.status === 'Accepted' ? 'pointer' : 'not-allowed',
                                                    fontWeight: 'bold',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Enter Arena
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        )}


      </div>
    </div>
    </div>
  );
};

export default UserDashboard;
