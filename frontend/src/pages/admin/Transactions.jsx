import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import '../../styles/TournamentManagement.css'; // Reuse table styles
import '../../styles/AdminDashboard.css'; // Import admin dashboard styles for table

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/transactions`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            const data = await res.json();
            setTransactions(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>All Transactions</h1>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx._id}>
                                <td>{new Date(tx.date).toLocaleString()}</td>
                                <td>{tx.userId ? tx.userId.username : 'Unknown'}</td>
                                <td>
                                    <span className={`status ${tx.type === 'credit' ? 'active' : 'inactive'}`}>
                                        {tx.type.toUpperCase()}
                                    </span>
                                </td>
                                <td>{tx.amount.toFixed(2)}</td>
                                <td>{tx.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Transactions;