import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import OneToOneResults from './OneToOneResults';
import { TargetTextDisplay, TypedTextDisplay } from './OneToOneComponents';
import '../../styles/TypingArena.css';

// --- Helper Functions ---

const saveContestToStorage = (id, data) => {
  try {
    localStorage.setItem(`contest_${id}`, JSON.stringify(data));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn("LocalStorage quota exceeded. Clearing old contests...");
        // Clear all other contest entries
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('contest_') && key !== `contest_${id}`) {
                localStorage.removeItem(key);
            }
        });
        // Try one more time
        try {
            localStorage.setItem(`contest_${id}`, JSON.stringify(data));
        } catch (retryErr) {
            console.error("Could not save contest state to local storage:", retryErr);
        }
    }
  }
};

const normalizeTestText = (text) => {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    // Normalize smart quotes/apostrophes to straight ones
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes/apostrophes
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
    .replace(/\s+/g, ' ')
    .trim();
};

const splitTextIntoFixedLines = (text, maxChars = 45) => {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = [];
  let currentLength = 0;

  for (const word of words) {
    const wordLen = word.length;
    const spaceLen = currentLine.length > 0 ? 1 : 0;
    
    if (currentLength + spaceLen + wordLen <= maxChars) {
      currentLine.push(word);
      currentLength += spaceLen + wordLen;
    } else {
      if (currentLine.length > 0) lines.push(currentLine.join(' '));
      currentLine = [word];
      currentLength = wordLen;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine.join(' '));
  return lines;
};

const buildTypedText = (words, current) => {
  if (!words.length) return current || '';
  if (!current) return `${words.join(' ')} `;
  return `${words.join(' ')} ${current}`;
};

const formatMmSs = (seconds) => {
  if (seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const StatsRow = ({ stats }) => (
  <div className="stats-row">
    <div className="stat-item">
      <span className="stat-label">NET SPEED</span>
      <span className="stat-value">{stats.netWpm}</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">GROSS SPEED</span>
      <span className="stat-value">{stats.grossWpm}</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">ACCURACY</span>
      <span className="stat-value">{stats.accuracy}%</span>
    </div>
  </div>
);

// --- Main Component ---

const OneToOneArena = () => {
  const { id } = useParams();
  const location = useLocation();
  const isResultsRoute = location.pathname.includes('/results');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const myUserId = user?._id || user?.id;

  // --- State Initialization ---

  const [contest, setContest] = useState(() => {
    try {
      if (location.state?.contest) {
          return location.state.contest;
      }
      const cachedStr = localStorage.getItem(`contest_${id}`);
      return cachedStr ? JSON.parse(cachedStr) : null;
    } catch (e) {
      return null;
    }
  });

  // Fetch full contest details if missing (e.g., after refresh)
  useEffect(() => {
    const fetchContest = async () => {
      if (!id) return;
      // If we already have challenger and opponent (populated), we're likely good
      if (contest?.challenger?._id && contest?.opponent?._id) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/one-to-one/${id}`, {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          setContest(prev => ({
            ...data,
            contestText: prev?.contestText || data.contestText // Keep current if already set
          }));
        }
      } catch (err) {
        console.error("Failed to fetch contest details", err);
      }
    };
    fetchContest();
  }, [id]);

  const [currentRound, setCurrentRound] = useState(() => {
    // Priority 1: Check timeline from contest object
    if (contest?.timeline) {
        const now = Date.now();
        const t = contest.timeline;
        if (t.round3Start && now >= new Date(t.round3Start).getTime()) return 3;
        if (t.round2Start && now >= new Date(t.round2Start).getTime()) return 2;
        if (t.round1Start && now >= new Date(t.round1Start).getTime()) return 1;
    }
    return contest?.currentRound || 1;
  });
  const [totalRounds, setTotalRounds] = useState(() => contest?.totalRounds || 3);

  // Results / Break State
  const [isBreak, setIsBreak] = useState(() => !!location.state?.breakEndsAtMs);
  const [breakTime, setBreakTime] = useState(() => location.state?.breakTime || 0);
  const [breakEndsAtMs, setBreakEndsAtMs] = useState(() => location.state?.breakEndsAtMs || null);
  const [serverResults, setServerResults] = useState(() => {
    return location.state?.results ? { results: location.state.results } : null;
  });

  const [finalWinner, setFinalWinner] = useState(() => location.state?.winnerId || null);
  const [isContestFinished, setIsContestFinished] = useState(() => location.state?.isFinal || false);
  const [lastSubmittedResult, setLastSubmittedResult] = useState(null);
  
  // Text Processing
  const contestText = useMemo(() => normalizeTestText(contest?.contestText), [contest?.contestText]);
  
  const testLines = useMemo(() => splitTextIntoFixedLines(contestText, 45), [contestText]);
  
  const lineStartIndices = useMemo(() => {
    const indices = [0];
    let count = 0;
    testLines.forEach(line => {
      count += line.split(' ').length;
      indices.push(count);
    });
    return indices;
  }, [testLines]);

  const targetWords = useMemo(() => contestText ? contestText.split(' ') : [], [contestText]);

  // Gameplay State
  const [testInput, setTestInput] = useState('');
  const [testLockedTypedWords, setTestLockedTypedWords] = useState([]);
  const [testLockedCurrentWord, setTestLockedCurrentWord] = useState('');
  const [testHasStarted, setTestHasStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  
  // Opponent State
  const [opponentSnapshot, setOpponentSnapshot] = useState(null);
  
  const opponentUser = useMemo(() => {
    if (!contest) return null;

    const normalizeId = (id) => {
        if (!id) return '';
        return String(id._id || id.id || id);
    };

    const cId = normalizeId(contest.challenger);
    const oId = normalizeId(contest.opponent);
    const myId = normalizeId(user) || normalizeId(myUserId);

    // Explicitly identify my role
    const amIChallenger = myId === cId;
    const amIOpponent = myId === oId;

    // Return the OTHER user
    if (amIChallenger) return contest.opponent;
    if (amIOpponent) return contest.challenger;

    // Fallback: If I'm not clearly one of them (e.g. spectator or ID mismatch),
    // try to return the one that ISN'T me.
    if (cId && cId !== myId) return contest.challenger;
    if (oId && oId !== myId) return contest.opponent;

    // Last resort: just return opponent (legacy behavior, but risky)
    return contest.opponent;
  }, [contest, user, myUserId]);

  // Timer / Round State
  const [roundEndTime, setRoundEndTime] = useState(() => {
    // Priority 1: Check timeline from contest object (passed via state or local storage)
    if (contest?.timeline) {
        const round = contest.currentRound || 1;
        const endField = `round${round}End`;
        if (contest.timeline[endField]) {
            return contest.timeline[endField];
        }
    }
    // Priority 2: Legacy fallback
    if (contest?.timeline?.round1End && (contest?.currentRound || 1) === 1) {
        return contest.timeline.round1End;
    }
    return null;
  });
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());
  
  // Synchronize round state with timeline if available
  useEffect(() => {
    if (!contest?.timeline || isResultsRoute || isBreak) return;

    const now = nowMs + serverTimeOffset;
    const { timeline } = contest;

    // If we have a timeline, ensure currentRound and roundEndTime are correct for the current time
    // This handles cases where the user joins late or refreshes
    let targetRound = currentRound;
    let targetEndTime = roundEndTime;

    const r1Start = new Date(timeline.round1Start).getTime();
    const r2Start = new Date(timeline.round2Start).getTime();
    const r3Start = new Date(timeline.round3Start).getTime();

    if (now >= r3Start) {
        targetRound = 3;
        targetEndTime = timeline.round3End;
    } else if (now >= r2Start) {
        targetRound = 2;
        targetEndTime = timeline.round2End;
    } else if (now >= r1Start) {
        targetRound = 1;
        targetEndTime = timeline.round1End;
    }

    if (targetRound !== currentRound) {
        console.log(`Syncing currentRound to ${targetRound} based on timeline`);
        setCurrentRound(targetRound);
    }
    if (targetEndTime && targetEndTime !== roundEndTime) {
        console.log(`Syncing roundEndTime to ${targetEndTime} based on timeline`);
        setRoundEndTime(targetEndTime);
    }
  }, [contest?.timeline, isResultsRoute, isBreak, nowMs, serverTimeOffset, currentRound, roundEndTime]);

  // Refs
  const inputRef = useRef(null);
  const isFinishedRef = useRef(isFinished);
  const socketRef = useRef(socket);
  const hasNavigatedRef = useRef(false);
  const wordNodesRef = useRef(new Map());
  const activeWordRef = useRef(null);

  // Stats Calculation Helper
  const getLiveStats = useCallback((typedWords, currWord, startTs, nowTs) => {
      // Use fixed duration from contest settings or default to 5 minutes (300s)
      const fixedDurationSec = contest?.durationSec || 300;
      const durationMin = fixedDurationSec / 60;
      
      if (!startTs) return { netWpm: 0, grossWpm: 0, accuracy: 0 };
      
      let correctChars = 0;
      let totalChars = 0;

      // Count locked words
      typedWords.forEach((word, idx) => {
          const target = targetWords[idx] || '';
          const isCorrect = word === target;
          const wordLen = word.length + 1; // +1 for space
          totalChars += wordLen;
          if (isCorrect) correctChars += wordLen;
      });

      // Count current word (partial)
      if (currWord) {
          totalChars += currWord.length;
          const targetIndex = typedWords.length;
          const target = targetWords[targetIndex] || '';
          
          let matchLen = 0;
          for(let i=0; i<currWord.length; i++) {
              if (i < target.length && currWord[i] === target[i]) {
                  matchLen++;
              } else {
                  break; 
              }
          }
          correctChars += matchLen;
      }

      const grossWpm = Math.round((totalChars / 5) / durationMin);
      const netWpm = Math.round((correctChars / 5) / durationMin);
      const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

      return { netWpm, grossWpm, accuracy };
  }, [targetWords, contest?.durationSec]);

  const myStats = useMemo(() => {
      return getLiveStats(testLockedTypedWords, testLockedCurrentWord, startTime, nowMs);
  }, [testLockedTypedWords, testLockedCurrentWord, startTime, nowMs, getLiveStats]);

  const opponentStats = useMemo(() => {
      if (!opponentSnapshot) return { netWpm: 0, grossWpm: 0, accuracy: 0 };
      
      // Use opponent's start time if available, otherwise fallback to my start time 
      // This ensures we have *some* baseline if protocol version differs
      const oppStart = opponentSnapshot.startTime || startTime;

      return getLiveStats(
          opponentSnapshot.lockedTypedWords || [],
          opponentSnapshot.lockedCurrentWord || '',
          oppStart,
          nowMs
      );
  }, [opponentSnapshot, startTime, nowMs, getLiveStats]);

  // --- Effects ---

  useEffect(() => {
    console.log("OneToOneArena loaded - v1.2");
    isFinishedRef.current = isFinished; 
  }, [isFinished]);
  
  // Auto-scroll to active word
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [testLockedTypedWords.length]); 

  // Reset navigation ref on round change
  useEffect(() => {
      hasNavigatedRef.current = false;
  }, [currentRound]);

  // Timer Tick
  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

    // Force navigation fallback if server is slow
    useEffect(() => {
        if (!roundEndTime || isResultsRoute || hasNavigatedRef.current) return;
        
        // Remove 1s grace period to ensure immediate navigation on round end
        if ((nowMs + serverTimeOffset) >= new Date(roundEndTime).getTime()) {
            hasNavigatedRef.current = true;
            setIsFinished(true);
            console.log("Forcing navigation to results due to round end");
            
            navigate(`/one-to-one/play/${id}/results`, { 
              replace: true,
              state: {
                  results: [], 
                  round: currentRound,
                  totalRounds: totalRounds,
                  breakTime: 10,
                  breakEndsAtMs: Date.now() + 10000,
                  contestId: id,
                  isProvisional: true
              }
          });
        }
    }, [nowMs, roundEndTime, isResultsRoute, currentRound, totalRounds, id, navigate, serverTimeOffset]);

    // Force navigation back to arena when break ends
    useEffect(() => {
        if (!isBreak || !breakEndsAtMs || isContestFinished || !isResultsRoute) return;

        if (nowMs >= breakEndsAtMs) {
            console.log("Break ended, forcing navigation back to arena");
            setIsBreak(false);
            
            // CLEAR old round text now so we don't show it for a split second
            setContest(prev => ({ ...prev, contestText: '' }));
            
            // Update localStorage to ensure we don't pick up stale data on remount
            try {
                const currentStored = JSON.parse(localStorage.getItem(`contest_${id}`) || '{}');
                // Clear text
                currentStored.contestText = '';
                // Optimistically increment round if safe
                if (currentStored.currentRound && Number(currentStored.currentRound) < (currentStored.totalRounds || 3)) {
                     currentStored.currentRound = Number(currentStored.currentRound) + 1;
                }
                localStorage.setItem(`contest_${id}`, JSON.stringify(currentStored));
            } catch (e) {
                console.error("Failed to update storage on break end", e);
            }

            // Navigate back, showing "Waiting for Round..." if text hasn't arrived yet
            navigate(`/one-to-one/play/${id}`, { replace: true });
        }
    }, [nowMs, isBreak, breakEndsAtMs, isContestFinished, isResultsRoute, id, navigate]);

  // Socket Connection & Events
  useEffect(() => {
    if (!id || !socket || !isConnected) return;
    
    socket.emit('arena:join', id);

    const handleRoundStart = (data) => {
        // console.log('Round Start:', data);
        const nextRound = Number(data.roundNumber || data.round || 1);
        const newText = normalizeTestText(data.contestText);
        
        // Prevent reset if already finished and round is same (rare race condition)
        if (isFinishedRef.current && nextRound === currentRound) return;

        setContest(prev => {
            const newState = { ...prev, contestText: newText, currentRound: nextRound };
            saveContestToStorage(id, { ...newState, _id: id });
            return newState;
        });
        
        setCurrentRound(nextRound);
        if (data.totalRounds) setTotalRounds(data.totalRounds);
        setRoundEndTime(data.endTime);
        
        // Reset Gameplay
        setIsBreak(false);
        setIsFinished(false);
        hasNavigatedRef.current = false;
        setTestInput('');
        setTestLockedTypedWords([]);
        setTestLockedCurrentWord('');
        setTestHasStarted(false);
        setStartTime(null);
        setOpponentSnapshot(null);
        setServerResults(null);
        setLastSubmittedResult(null);
        
        // If on results page, navigate back
        if (window.location.pathname.includes('/results')) {
            navigate(`/one-to-one/play/${id}`, { 
                replace: true,
                state: { 
                    contest: { 
                        ...contest, 
                        contestText: newText, 
                        currentRound: nextRound,
                        totalRounds: data.totalRounds || totalRounds
                    } 
                }
            });
        }
    };

    const handleOpponentUpdate = (payload) => {
        if (String(payload.contestId) === String(id) && payload.snapshot) {
            setOpponentSnapshot(payload.snapshot);
        }
    };

    const handleRoundResult = (data) => {
        hasNavigatedRef.current = true;
        // console.log('Round Result:', data);
        
        const finalResults = data.results || [];
        setServerResults({ results: finalResults });
        
        // Update contest state with latest results to ensure persistence
        setContest(prev => ({
            ...prev,
            results: finalResults
        }));
        
        setIsBreak(true);
        setIsFinished(true);
        setBreakTime(data.countdown || 10);
        
        const nextStart = data.nextRoundStart ? new Date(data.nextRoundStart).getTime() : Date.now() + (data.countdown || 10) * 1000;
        setBreakEndsAtMs(nextStart);

        navigate(`/one-to-one/play/${id}/results`, { 
            replace: true,
            state: {
                results: finalResults,
                round: data.round,
                totalRounds: data.totalRounds,
                breakTime: data.countdown,
                breakEndsAtMs: nextStart,
                contestId: id
            }
        });
    };

    const handleContestFinal = (data) => {
        hasNavigatedRef.current = true;
        setFinalWinner(data.winnerId);
        
        // Update both serverResults and contest state
        setServerResults({ results: data.results });
        setContest(prev => ({
            ...prev,
            results: data.results,
            winner: data.winnerId,
            status: 'Completed'
        }));
        
        setIsFinished(true);
        setIsContestFinished(true);
        navigate(`/one-to-one/play/${id}/results`, { 
            replace: true, 
            state: { isFinal: true, winnerId: data.winnerId, results: data.results } 
        });
    };

    const handleContestRestore = (data) => {
        console.log('Restoring Contest:', data);
        if (data.contestText) {
             const newText = normalizeTestText(data.contestText);
             setContest(prev => {
                const updated = { ...prev, contestText: newText };
                if (data.contestId) updated._id = data.contestId;
                // If we don't have opponent data yet, try to use what we can
                // Ideally contest object should be fully populated by now via API, 
                // but if we arrived here via link, 'contest' state might be sparse.
                return updated;
             });
             saveContestToStorage(id, { contestText: newText, _id: id });
        }
        if (data.roundNumber) setCurrentRound(data.roundNumber);
        if (data.endTime) setRoundEndTime(data.endTime);
        if (data.opponentSnapshot) setOpponentSnapshot(data.opponentSnapshot);
        if (data.mySnapshot) {
             if (data.mySnapshot.lockedTypedWords) setTestLockedTypedWords(data.mySnapshot.lockedTypedWords);
             if (data.mySnapshot.lockedCurrentWord) setTestLockedCurrentWord(data.mySnapshot.lockedCurrentWord);
        }
    };
    
    const handleCountdown = (data) => {
        if (data.seconds <= 0) {
             // Round starting immediately
             setIsBreak(false);
             // REMOVED: Navigation from here to avoid showing old round before new round data arrives
        } else {
             setBreakTime(data.seconds);
             setBreakEndsAtMs(Date.now() + data.seconds * 1000);
        }
    };

    socket.on('round:start', handleRoundStart);
    socket.on('opponent:update', handleOpponentUpdate);
    socket.on('round:result', handleRoundResult);
    socket.on('contest:final', handleContestFinal);
    socket.on('contest:restore', handleContestRestore);
    socket.on('round:countdown', handleCountdown);

    return () => {
        socket.off('round:start', handleRoundStart);
        socket.off('opponent:update', handleOpponentUpdate);
        socket.off('round:result', handleRoundResult);
        socket.off('contest:final', handleContestFinal);
        socket.off('contest:restore', handleContestRestore);
        socket.off('round:countdown', handleCountdown);
    };
  }, [id, socket, isConnected, currentRound, navigate]);

  // --- Input Handling ---

  const emitProgress = (lockedWords, currentWord) => {
    if (!socket || !isConnected) return;
    socket.emit('typing:update', {
        contestId: id,
        snapshot: {
            lockedTypedWords: lockedWords,
            lockedCurrentWord: currentWord,
            completedChars: lockedWords.join('').length + lockedWords.length + currentWord.length,
            startTime: startTime // Include start time for remote calculation
        }
    });
  };

  const handleKeyDown = (e) => {
    if (isFinished || !contestText) return;
    
    // Safety check for timer
    if (roundEndTime && Date.now() >= new Date(roundEndTime).getTime()) return;

    let key = e.key;
    
    // Normalize user input key if it's a smart quote
    if (key.length === 1) {
        if (key === '\u2018' || key === '\u2019') key = "'";
        if (key === '\u201C' || key === '\u201D') key = '"';
        if (key === '\u00A0') key = ' ';
    }
    
    // Ignore navigation keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Tab', 'Enter', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(key)) {
        if (key === 'Tab') e.preventDefault();
        return;
    }

    if (!testHasStarted) {
        setTestHasStarted(true);
        if (!startTime) setStartTime(Date.now());
    }

    if (key === 'Backspace') {
        if (testLockedCurrentWord.length > 0) {
            const nextCurrent = testLockedCurrentWord.slice(0, -1);
            setTestLockedCurrentWord(nextCurrent);
            emitProgress(testLockedTypedWords, nextCurrent);
        }
        return;
    }

    if (key === ' ') {
        e.preventDefault();
        const nextWords = [...testLockedTypedWords, testLockedCurrentWord];
        setTestLockedTypedWords(nextWords);
        setTestLockedCurrentWord('');
        
        emitProgress(nextWords, '');

        // Check Completion
        if (nextWords.length >= targetWords.length) {
            handleCompletion(nextWords);
        }
        return;
    }

    if (key.length === 1) {
        const nextCurrent = testLockedCurrentWord + key;
        setTestLockedCurrentWord(nextCurrent);
        emitProgress(testLockedTypedWords, nextCurrent);
    }
  };

  const handleCompletion = async (finalWords) => {
      setIsFinished(true);
      
      // Calculate Stats Locally using Fixed Duration
      const fixedDurationSec = contest?.durationSec || 300;
      const durationMin = fixedDurationSec / 60;
      
      let correctChars = 0;
      let totalChars = 0;
      
      finalWords.forEach((word, idx) => {
          const target = targetWords[idx] || '';
          const isCorrect = word === target;
          const wordLen = word.length + (idx < finalWords.length - 1 ? 1 : 0); // +1 for space
          
          totalChars += wordLen;
          if (isCorrect) correctChars += wordLen;
      });
      
      const grossWpm = Math.round((totalChars / 5) / durationMin);
      const netWpm = Math.round((correctChars / 5) / durationMin);
      const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

      const payload = {
          contestId: id,
          round: currentRound,
          results: {
              wpm: netWpm, // Legacy field
              netWpm,
              grossWpm,
              accuracy,
              rawWpm: grossWpm
          }
      };
      
      setLastSubmittedResult(payload.results);
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/one-to-one/${id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.yourResult) setLastSubmittedResult(data.yourResult);
      } catch (err) {
          console.error("Submit failed", err);
      }
  };

  // --- View Calculation ---

  const calculateVisibleLines = (activeWordIndex) => {
     let activeLineIndex = 0;
     for (let i = 0; i < lineStartIndices.length - 1; i++) {
         if (activeWordIndex >= lineStartIndices[i] && activeWordIndex < lineStartIndices[i+1]) {
             activeLineIndex = i;
             break;
         }
     }
     if (activeWordIndex >= lineStartIndices[lineStartIndices.length - 1]) {
         activeLineIndex = testLines.length - 1;
     }

     const ARENA_VISIBLE_LINES = 5;
     const startLine = Math.max(0, Math.min(activeLineIndex - 2, testLines.length - ARENA_VISIBLE_LINES));
     const visible = testLines.slice(startLine, startLine + ARENA_VISIBLE_LINES);
     
     return { visibleLines: visible, startLineIndex: startLine };
  };

  // My View
  const myActiveWordIndex = testLockedTypedWords.length;
  const { visibleLines: myVisibleLines, startLineIndex: myStartLineIndex } = calculateVisibleLines(myActiveWordIndex);

  // Opponent View
  const oppLockedWords = opponentSnapshot?.lockedTypedWords || [];
  const oppCurrentWord = opponentSnapshot?.lockedCurrentWord || '';
  const oppActiveWordIndex = oppLockedWords.length;
  const { visibleLines: oppVisibleLines, startLineIndex: oppStartLineIndex } = calculateVisibleLines(oppActiveWordIndex);

  // --- Render ---

  // Check if we are on results page route
  if (isResultsRoute) {
      return (
          <OneToOneResults 
            contest={contest}
            serverResults={serverResults}
            currentRound={currentRound}
            totalRounds={totalRounds}
            isBreak={isBreak}
            breakTime={breakTime}
            breakEndsAtMs={breakEndsAtMs}
            finalWinner={finalWinner}
            isContestFinished={isContestFinished}
            myUserId={myUserId}
            onBack={() => navigate('/dashboard')}
            lastSubmittedResult={lastSubmittedResult}
            opponentSnapshot={opponentSnapshot}
            myStats={myStats}
            opponentStats={opponentStats}
          />
      );
  }

  const timeLeft = roundEndTime ? Math.max(0, Math.ceil((new Date(roundEndTime).getTime() - (nowMs + serverTimeOffset)) / 1000)) : 0;
  // Double height for split view (Target + Input)
  const ARENA_HEIGHT = `calc((1.1rem * 1.6 * 5 + 20px) * 2 + 40px)`; 

  if (!contestText && !isBreak && !isResultsRoute) {
      return (
        <div className="arena-loading">
            <h2>Initializing Arena...</h2>
            <div className="loading-spinner"></div>
            <p>Setting up your typing environment</p>
            <style>{`
                .arena-loading {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at center, #2a0a4d 0%, #120422 100%);
                    color: #fff;
                    font-family: 'Roboto Mono', monospace;
                }
                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(164, 53, 240, 0.3);
                    border-radius: 50%;
                    border-top-color: #a435f0;
                    animation: spin 1s ease-in-out infinite;
                    margin-bottom: 20px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
      );
  }

  return (
    <div className="one-to-one-arena">
      {/* Header */}
      <div className="arena-header">
         <div className="round-badge">ROUND {currentRound} / {totalRounds}</div>
         <div className="timer-badge">{formatMmSs(timeLeft)}</div>
         <button className="cancel-btn" onClick={() => navigate('/dashboard')}>Exit</button>
         <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '10px', color: '#555' }}>v1.2</div>
      </div>

      {/* Split View */}
      <div className="arena-split-view">
         
         {/* My Side */}
         <div className="player-lane my-lane" onClick={() => inputRef.current?.focus()}>
            <div className="lane-header">
                <span className="player-name">{user?.username || 'You'}</span>
                <span className="player-status">{isFinished ? 'Finished' : 'Typing...'}</span>
            </div>

            <StatsRow stats={myStats} />

            <div className="typing-area" style={{ height: ARENA_HEIGHT }}>
                {myVisibleLines.length > 0 ? (
                    <div className="split-container">
                        <div className="text-section target-section">
                            <TargetTextDisplay 
                                visibleLines={myVisibleLines}
                                startLineIndex={myStartLineIndex}
                                globalLineStartIndices={lineStartIndices}
                                activeWordIndex={myActiveWordIndex}
                                lockedWords={testLockedTypedWords}
                                currentWord={testLockedCurrentWord}
                                wordNodesRef={wordNodesRef}
                                activeWordRef={activeWordRef}
                            />
                        </div>
                        <div className="text-section input-section">
                            <TypedTextDisplay
                                visibleLines={myVisibleLines}
                                startLineIndex={myStartLineIndex}
                                globalLineStartIndices={lineStartIndices}
                                activeWordIndex={myActiveWordIndex}
                                lockedWords={testLockedTypedWords}
                                currentWord={testLockedCurrentWord}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="waiting-text">
                        {contestText ? 'Preparing text...' : 'Waiting for round text...'}
                    </div>
                )}
            </div>
            
            <input 
                ref={inputRef}
                className="hidden-input"
                autoFocus
                value={testInput}
                onChange={() => {}}
                onKeyDown={handleKeyDown}
                onBlur={() => inputRef.current?.focus()}
            />
         </div>

         {/* Separator */}
         <div className="lane-separator"></div>

         {/* Opponent Side */}
         <div className="player-lane opponent-lane">
            <div className="lane-header">
                <span className="player-name">{opponentUser?.username || 'Opponent'}</span>
                <span className="player-status">
                    {opponentSnapshot?.isFinished ? 'Finished' : (opponentSnapshot ? 'Typing...' : 'Waiting...')}
                </span>
            </div>

            <StatsRow stats={opponentStats} />

            <div className="typing-area" style={{ height: ARENA_HEIGHT, opacity: 0.8 }}>
                {oppVisibleLines.length > 0 ? (
                    <div className="split-container">
                        <div className="text-section target-section">
                             <TargetTextDisplay 
                                visibleLines={oppVisibleLines}
                                startLineIndex={oppStartLineIndex}
                                globalLineStartIndices={lineStartIndices}
                                activeWordIndex={oppActiveWordIndex}
                                lockedWords={oppLockedWords}
                                currentWord={oppCurrentWord}
                            />
                        </div>
                        <div className="text-section input-section">
                             <TypedTextDisplay
                                visibleLines={oppVisibleLines}
                                startLineIndex={oppStartLineIndex}
                                globalLineStartIndices={lineStartIndices}
                                activeWordIndex={oppActiveWordIndex}
                                lockedWords={oppLockedWords}
                                currentWord={oppCurrentWord}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="waiting-text">Waiting for opponent...</div>
                )}
            </div>
         </div>

      </div>

      <style>{`
        .one-to-one-arena {
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: radial-gradient(circle at center, #2a0a4d 0%, #120422 100%);
            overflow: hidden;
            font-family: 'Roboto Mono', monospace;
            color: #fff;
        }
        .arena-header {
            height: 70px;
            background: rgba(20, 0, 40, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 32px;
            box-shadow: 0 4px 20px rgba(164, 53, 240, 0.2);
            z-index: 10;
            border-bottom: 1px solid rgba(164, 53, 240, 0.3);
        }
        .round-badge { 
            font-weight: 900; 
            color: #d8b4fe; 
            letter-spacing: 2px;
            text-shadow: 0 0 10px rgba(164, 53, 240, 0.5);
            font-size: 1.2rem;
        }
        .timer-badge { 
            font-family: 'Courier New', monospace; 
            font-size: 42px; 
            font-weight: 700; 
            color: #d946ef; /* Purple Neon */
            text-shadow: 0 0 15px #a020f0, 0 0 30px #a020f0;
            letter-spacing: 2px;
        }
        .cancel-btn { 
            background: rgba(255, 50, 50, 0.1); 
            color: #ff5252; 
            border: 1px solid rgba(255, 50, 50, 0.3); 
            padding: 8px 24px; 
            border-radius: 4px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .cancel-btn:hover {
            background: rgba(255, 50, 50, 0.2);
            box-shadow: 0 0 15px rgba(255, 50, 50, 0.4);
        }
        
        .arena-split-view {
            flex: 1;
            display: flex;
            padding: 24px;
            gap: 40px;
            max-width: 1600px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
            align-items: center; 
            justify-content: center;
        }
        
        .player-lane {
            flex: 1;
            background: transparent;
            border-radius: 16px;
            box-shadow: none;
            padding: 5px;
            display: flex;
            flex-direction: column;
            position: relative;
            min-width: 0;
            max-width: 700px;
            border: 1px solid rgba(164, 53, 240, 0.2);
            backdrop-filter: none;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .my-lane { 
            border: 2px solid #a855f7; 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
        }
        .opponent-lane { 
            border: 2px solid #ec4899; 
            background: transparent;
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.2);
        }
        
        .lane-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stats-row {
            display: flex;
            justify-content: space-around;
            margin-bottom: 16px;
            background: rgba(0, 0, 0, 0.2);
            padding: 8px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .stat-label {
            font-size: 0.8rem;
            color: #d8b4fe;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #fff;
            text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .player-name { 
            font-size: 20px; 
            font-weight: 800; 
            color: #fff; 
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .player-status { 
            font-size: 14px; 
            color: #aaa; 
            font-weight: 600; 
            text-transform: uppercase;
        }
        
        .typing-area {
            position: relative;
            background: rgba(10, 5, 20, 0.6);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 8px;
            font-family: 'Roboto Mono', monospace;
            font-size: 1.2rem;
            line-height: 1.6;
            overflow: hidden;
            user-select: none;
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            min-width: 0;
        }

        .split-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            overflow: hidden;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            background: rgba(0, 0, 0, 0.4);
        }

        .text-section {
            flex: 1;
            padding: 8px;
            overflow: hidden;
            position: relative;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            min-width: 0;
        }

        .target-section {
            background: transparent;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.6);
        }

        .input-section {
            background: rgba(0, 0, 0, 0.2);
            color: #fff;
        }

        .text-section span {
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.1);
        }

        /* Customize scrollbars for gaming feel */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #120422; 
        }
        ::-webkit-scrollbar-thumb {
            background: #5b21b6; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #7c3aed; 
        }

        .section-label {
            display: none; /* Hide labels as requested */
        }
        
        .hidden-input {
            position: absolute;
            opacity: 0;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            cursor: default;
        }
        
        .waiting-text {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-style: italic;
        }

        .arena-loading {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f0f2f5;
            color: #555;
        }
      `}</style>
    </div>
  );
};

export default OneToOneArena;
