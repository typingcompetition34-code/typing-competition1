import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import '../styles/PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, onSubmit, tournament, charities }) => {
    const [selectedCharity, setSelectedCharity] = useState('');
    const [_receipt, _setReceipt] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [_bankAccounts, setBankAccounts] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetch(`${API_BASE_URL}/api/accounts`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setBankAccounts(data);
                    } else {
                        setBankAccounts([]);
                    }
                })
                .catch(err => console.error("Error fetching accounts:", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        try {
            await onSubmit({
                tournamentId: tournament._id || tournament.id,
                charityId: selectedCharity || null,
                amount: tournament.entryFee
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="payment-modal">
                <div className="modal-header">
                    <h2>Confirm Entry Fee Payment</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="payment-info">
                        <p><strong>Tournament:</strong> {tournament.title}</p>
                        <p><strong>Entry Fee:</strong> {tournament.entryFee}</p>
                        <p style={{marginTop: '10px', color: '#666'}}>
                            The entry fee will be deducted from your wallet balance.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Choose Charity Cause to Support (optional)</label>
                            <select 
                                value={selectedCharity} 
                                onChange={(e) => setSelectedCharity(e.target.value)}
                            >
                                <option value="">Select a Charity (optional)</option>
                                {charities.map(c => (
                                    <option key={c._id} value={c._id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : 'Pay & Join'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
