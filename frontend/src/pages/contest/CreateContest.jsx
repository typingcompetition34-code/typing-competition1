import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContest } from '../../services/contestService';

const CreateContest = () => {
    const [category, setCategory] = useState('Full Keyboard');
    const [entryFee, setEntryFee] = useState(0);
    const [scheduledTime, setScheduledTime] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createContest({
                category,
                entryFee: Number(entryFee),
                scheduledStartTime: new Date(scheduledTime).toISOString()
            });
            navigate('/contests'); // Go to list or lobby
        } catch (err) {
            alert('Error creating contest: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create Contest</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Category</label>
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option>Full Keyboard</option>
                        <option>Basic Home Row</option>
                        <option>Numeric Keys</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1">Entry Fee ($)</label>
                    <input 
                        type="number" 
                        value={entryFee} 
                        onChange={(e) => setEntryFee(e.target.value)}
                        className="w-full p-2 border rounded"
                        min="0"
                    />
                </div>
                <div>
                    <label className="block mb-1">Start Time</label>
                    <input 
                        type="datetime-local" 
                        value={scheduledTime} 
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                    Create Contest
                </button>
            </form>
        </div>
    );
};

export default CreateContest;
