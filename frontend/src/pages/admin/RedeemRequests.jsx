import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import '../../styles/TournamentManagement.css'; // Reuse table styles
import '../../styles/AdminDashboard.css'; // Import admin dashboard styles for table

const RedeemRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/redeem/admin`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            const data = await res.json();
            setRequests(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/redeem/${id}/action`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ action })
            });

            if (res.ok) {
                setMsg(`Request ${action}ed successfully.`);
                fetchRequests();
            } else {
                const data = await res.json();
                setMsg(data.message || 'Error processing request.');
            }
        } catch (err) {
            console.error(err);
            setMsg('Server Error');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Redeem Requests</h1>
            </div>
            {msg && <p className="msg">{msg}</p>}
            
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Reason</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req._id}>
                                <td>
                                    <strong>{req.userId?.username}</strong><br/>
                                    <small>{req.userId?.email}</small>
                                </td>
                                <td>{req.amount}</td>
                                <td>{req.reason}</td>
                                <td>{new Date(req.requestDate).toLocaleString()}</td>
                                <td>
                                    <span className={`status ${req.status.toLowerCase()}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td>
                                    {req.status === 'Pending' && (
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => handleAction(req._id, 'approve')}
                                                className="btn-approve"
                                                style={{backgroundColor: '#4CAF50', color: 'white', marginRight: '5px', border: 'none', padding: '5px 10px', cursor: 'pointer'}}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req._id, 'reject')}
                                                className="btn-reject"
                                                style={{backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'}}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <p>Loading...</p>}
                {!loading && requests.length === 0 && <p>No redeem requests found.</p>}
            </div>
        </div>
    );
};

export default RedeemRequests;
