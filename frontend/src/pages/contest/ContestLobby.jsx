import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContest, acceptContest } from '../../services/contestService';
import { useContestStore } from '../../store/contestStore';

const ContestLobby = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contestData, setContestData] = useState(null);
    const setContest = useContestStore(state => state.setContest);
    
    // Parse user safely
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchContest = async () => {
            try {
                const data = await getContest(id);
                setContestData(data);
                setContest(data);
                
                if (data.status === 'ACTIVE') {
                     navigate(`/contest/${id}/arena`);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchContest();
        const interval = setInterval(fetchContest, 5000); // Poll status
        return () => clearInterval(interval);
    }, [id, navigate, setContest]);

    const handleAccept = async () => {
        try {
            await acceptContest(id);
            const data = await getContest(id);
            setContestData(data);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if (!contestData) return <div>Loading...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Contest Lobby</h1>
            <div className="bg-gray-100 p-6 rounded shadow">
                <p><strong>Category:</strong> {contestData.category}</p>
                <p><strong>Entry Fee:</strong> ${contestData.entryFee}</p>
                <p><strong>Status:</strong> {contestData.status}</p>
                <p><strong>Start Time:</strong> {new Date(contestData.scheduledStartTime).toLocaleString()}</p>
                
                <div className="mt-6 flex justify-around">
                    <div className="p-4 bg-white rounded shadow w-1/3">
                        <p className="font-bold">Player 1</p>
                        <p>{contestData.createdBy?.username || 'Unknown'}</p>
                    </div>
                    <div className="p-4 bg-white rounded shadow w-1/3">
                        <p className="font-bold">Player 2</p>
                        {contestData.acceptedBy ? (
                            <p>{contestData.acceptedBy.username}</p>
                        ) : (
                            <p className="text-gray-500">Waiting...</p>
                        )}
                    </div>
                </div>

                {!contestData.acceptedBy && currentUser && contestData.createdBy._id !== currentUser.user.id && (
                    <button 
                        onClick={handleAccept}
                        className="mt-6 bg-green-600 text-white px-6 py-2 rounded text-lg hover:bg-green-700"
                    >
                        Accept & Pay ${contestData.entryFee}
                    </button>
                )}

                {contestData.status === 'SCHEDULED' && (
                    <div className="mt-6 text-blue-600 font-medium">
                        Contest is scheduled! Please wait on this page or come back at start time.
                        System will auto-redirect when active.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestLobby;
