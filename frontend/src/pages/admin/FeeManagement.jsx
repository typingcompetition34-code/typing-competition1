import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import '../../styles/AdminDashboard.css';

const FeeManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/payments/admin`, {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter only tournament entry fees
                const tournamentFees = data.filter(req => req.type === 'tournament_entry');
                setRequests(tournamentFees);
            } else {
                console.error('Failed to fetch payments');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/payments/${id}/action`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ action })
            });
            
            if (res.ok) {
                fetchRequests(); // Refresh list
                alert(`Request ${action}ed successfully`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-content-wrapper">
            <h2>Fee Management</h2>
            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Loading payment requests...</div>
            ) : (
                <div className="table-container">
                    {requests.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No payment requests found.</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Tournament</th>
                                    <th>Amount</th>
                                    <th>Charity</th>
                                    <th>Receipt</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req._id}>
                                        <td>
                                            {req.user?.username} <br/>
                                            <small style={{fontSize: '10px', color: '#666'}}>{req.user?.uniqueKey}</small>
                                        </td>
                                        <td>{req.tournament?.title}</td>
                                        <td>{req.amount}</td>
                                        <td>{req.charity?.title}</td>
                                        <td>
                                            {req.receiptUrl ? (
                                                <a href={`${API_BASE_URL}/${req.receiptUrl}`} target="_blank" rel="noopener noreferrer">View Receipt</a>
                                            ) : (
                                                <span style={{ color: '#999' }}>N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${req.status}`} style={{textTransform: 'capitalize'}}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>
                                            {req.status === 'pending' && (
                                                <>
                                                    <button 
                                                        className="btn-approve" 
                                                        onClick={() => handleAction(req._id, 'approve')}
                                                        style={{marginRight: '10px', background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button 
                                                        className="btn-reject" 
                                                        onClick={() => handleAction(req._id, 'reject')}
                                                        style={{background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeeManagement;
