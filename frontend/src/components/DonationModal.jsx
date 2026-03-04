import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import '../styles/PaymentModal.css'; // Reuse payment modal styles

const DonationModal = ({ isOpen, onClose, charity, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/donations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    charityId: charity._id,
                    amount: amount
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Donation successful! Thank you for your support.');
                setAmount('');
                onClose();
                if (onSubmit) onSubmit();
            } else {
                alert(data.message || 'Donation failed');
            }
        } catch (err) {
            console.error('Donation error:', err);
            alert('Error submitting donation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="payment-modal">
                <div className="modal-header">
                    <h2>Donate to {charity.title}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="payment-info">
                        <p><strong>Charity Cause:</strong> {charity.title}</p>
                        <p style={{marginTop: '10px', color: '#666'}}>
                            The donation amount will be deducted directly from your wallet balance.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Donation Amount</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                required
                                min="1"
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : 'Donate Now'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DonationModal;
