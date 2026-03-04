import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOpenContests, getUserContests } from '../../services/contestService';

const ContestList = () => {
    const [openContests, setOpenContests] = useState([]);
    const [myContests, setMyContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const [open, my] = await Promise.all([getOpenContests(), getUserContests()]);
            setOpenContests(open);
            setMyContests(my);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading contests...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Typing Contests</h1>
                <Link to="/contest/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Create New Contest
                </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Open Contests */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-green-700">Open Contests (Join Now)</h2>
                    {openContests.length === 0 ? (
                        <p className="text-gray-500">No open contests available.</p>
                    ) : (
                        <div className="space-y-4">
                            {openContests.map(contest => (
                                <div key={contest._id} className="bg-white p-4 rounded shadow border hover:shadow-md transition">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold">{contest.category}</span>
                                        <span className="text-green-600 font-bold">${contest.entryFee}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        Created by: {contest.createdBy?.username || 'Unknown'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-4">
                                        Starts: {new Date(contest.scheduledStartTime).toLocaleString()}
                                    </div>
                                    <Link 
                                        to={`/contest/${contest._id}`}
                                        className="block w-full text-center bg-green-100 text-green-700 py-2 rounded hover:bg-green-200"
                                    >
                                        View & Join
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Contests */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-blue-700">My Contests</h2>
                    {myContests.length === 0 ? (
                        <p className="text-gray-500">You haven't participated in any contests yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {myContests.map(contest => (
                                <div key={contest._id} className="bg-white p-4 rounded shadow border">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold">{contest.category}</span>
                                        <span className={`font-bold ${
                                            contest.status === 'COMPLETED' ? 'text-gray-600' : 
                                            contest.status === 'ACTIVE' ? 'text-red-600' : 'text-blue-600'
                                        }`}>
                                            {contest.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        Fee: ${contest.entryFee}
                                    </div>
                                    <Link 
                                        to={contest.status === 'ACTIVE' ? `/contest/${contest._id}/arena` : `/contest/${contest._id}`}
                                        className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                                    >
                                        {contest.status === 'ACTIVE' ? 'Enter Arena' : 'View Details'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestList;
