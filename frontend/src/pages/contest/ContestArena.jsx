import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContestStore } from '../../store/contestStore';

const ContestArena = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { connectSocket, disconnectSocket, socket } = useContestStore();
    
    const [round, setRound] = useState(0);
    const [text, setText] = useState('');
    const [endTime, setEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [input, setInput] = useState('');
    const [stats, setStats] = useState({ netSpeed: 0, grossSpeed: 0, accuracy: 100, errors: 0 });
    const [opponentStats, setOpponentStats] = useState({ netSpeed: 0, grossSpeed: 0, accuracy: 0, errors: 0 });
    const [gameState, setGameState] = useState('WAITING'); // WAITING, PLAYING, ROUND_END, FINAL
    const [resultData, setResultData] = useState(null);
    const [winnerId, setWinnerId] = useState(null);

    const inputRef = useRef(null);
    const timerRef = useRef(null);

    // Parse user safely
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const s = connectSocket(id);

        s.on('contest:started', () => {
             console.log('Contest Started');
        });

        s.on('round:start', ({ roundNumber, text, endTime }) => {
            console.log(`Round ${roundNumber} Start`);
            setRound(roundNumber);
            setText(text);
            setEndTime(endTime);
            setInput('');
            setStats({ netSpeed: 0, grossSpeed: 0, accuracy: 100, errors: 0 });
            setGameState('PLAYING');
            if (inputRef.current) inputRef.current.focus();
        });

        s.on('round:end', ({ roundNumber }) => {
            console.log(`Round ${roundNumber} End`);
            setGameState('ROUND_END');
        });

        s.on('result:show', ({ roundNumber, results }) => {
            setResultData(results);
        });

        s.on('opponent:update', (data) => {
            setOpponentStats(data);
        });

        s.on('contest:final', ({ winnerId }) => {
            setWinnerId(winnerId);
            setGameState('FINAL');
        });

        return () => {
            disconnectSocket();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id, connectSocket, disconnectSocket]);

    // Timer Logic
    useEffect(() => {
        if (gameState === 'PLAYING' && endTime) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const end = new Date(endTime).getTime();
                const diff = Math.max(0, Math.floor((end - now) / 1000));
                setTimeLeft(diff);
                if (diff <= 0) clearInterval(timerRef.current);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState, endTime]);

    // Typing Logic
    const handleInput = (e) => {
        if (gameState !== 'PLAYING') return;
        const val = e.target.value;
        setInput(val);
        calculateStats(val);
    };

    const calculateStats = (val) => {
        const words = val.trim().split(/\s+/).length;
        const chars = val.length;
        
        // Fixed Round Duration logic
        // Always use the full fixed round duration (e.g. 5 minutes)
        // This ensures fairness: WPM is calculated based on the total available time, not just elapsed time.
        const minutes = 5; 
        
        if (minutes > 0) {
            const gross = (chars / 5) / minutes;
            let errs = 0;
            for(let i=0; i<val.length; i++) {
                if (val[i] !== text[i]) errs++;
            }
            
            const net = Math.max(0, gross - errs / minutes);
            const acc = chars > 0 ? ((chars - errs) / chars) * 100 : 100;

            const newStats = {
                netSpeed: Math.round(net),
                grossSpeed: Math.round(gross),
                accuracy: Math.round(acc),
                errors: errs,
                charactersTyped: chars
            };
            setStats(newStats);

            if (socket) {
                socket.emit('typing:update', {
                    contestId: id,
                    roundNumber: round,
                    userId: currentUser?.user?.id,
                    ...newStats
                });
            }
        }
    };

    const renderText = () => {
        return text.split('').map((char, index) => {
            let color = 'text-gray-500';
            if (index < input.length) {
                color = input[index] === char ? 'text-green-600' : 'text-red-600';
            }
            return <span key={index} className={color}>{char}</span>;
        });
    };
    
    const handlePaste = (e) => {
        e.preventDefault();
        alert('Paste is disabled!');
    };

    return (
        <div className="p-8 h-screen flex flex-col" onPaste={handlePaste} onCopy={handlePaste}>
            <div className="flex justify-between items-center mb-4 bg-gray-800 text-white p-4 rounded">
                <div className="text-xl">Round {round} / 3</div>
                <div className="text-3xl font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                <div className="text-xl">Opponent WPM: {opponentStats.netSpeed}</div>
            </div>

            <div className="flex-1 flex gap-4">
                <div className="w-2/3 flex flex-col">
                    <div className="bg-white p-6 rounded shadow mb-4 text-xl font-mono leading-relaxed h-64 overflow-y-auto select-none border">
                        {renderText()}
                    </div>
                    <textarea 
                        ref={inputRef}
                        value={input}
                        onChange={handleInput}
                        className="w-full h-32 p-4 border rounded text-xl font-mono"
                        placeholder="Type here..."
                        disabled={gameState !== 'PLAYING'}
                    />
                </div>

                <div className="w-1/3 bg-gray-100 p-6 rounded shadow">
                    <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
                    <div className="space-y-4 text-lg">
                        <div className="flex justify-between">
                            <span>Net WPM:</span>
                            <span className="font-bold text-blue-600">{stats.netSpeed}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Accuracy:</span>
                            <span className="font-bold text-green-600">{stats.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Errors:</span>
                            <span className="font-bold text-red-600">{stats.errors}</span>
                        </div>
                    </div>
                </div>
            </div>

            {gameState === 'ROUND_END' && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center text-white z-50">
                    <div className="bg-gray-900 p-8 rounded-xl max-w-2xl w-full text-center">
                        <h2 className="text-4xl font-bold mb-8">Round {round} Results</h2>
                        {resultData && resultData.map((res, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-800 p-4 mb-4 rounded">
                                <span className="text-xl">{res.userId.username}</span>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-400">{res.netSpeed} WPM</div>
                                    <div className="text-sm text-gray-400">{res.accuracy}% Acc</div>
                                </div>
                            </div>
                        ))}
                        <p className="mt-8 text-gray-400">Next round starts in 10 seconds...</p>
                    </div>
                </div>
            )}

            {gameState === 'FINAL' && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center text-white z-50">
                    <div className="bg-yellow-900 p-12 rounded-xl text-center border-4 border-yellow-500">
                        <h1 className="text-6xl font-bold mb-4">CONTEST OVER</h1>
                        <div className="text-3xl mb-8">
                            Winner: <span className="text-yellow-400">{winnerId === currentUser?.user?.id ? 'YOU!' : 'Opponent'}</span>
                        </div>
                        <button onClick={() => navigate('/')} className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestArena;
