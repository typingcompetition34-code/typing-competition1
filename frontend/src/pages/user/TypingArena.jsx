import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { TargetTextDisplay, TypedTextDisplay } from './OneToOneComponents';

// --- Helper Functions ---

const normalizeText = (text) => {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
};

const splitTextIntoFixedLines = (text, maxChars = 55) => {
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

const formatMmSs = (ms) => {
  if (ms < 0) return '00';
  const totalSeconds = Math.floor(ms / 1000);
  // Show only seconds if less than a minute, or mm:ss otherwise?
  // Image shows "00" which implies seconds or maybe it's just a 2-digit counter.
  // Let's stick to standard mm:ss but large.
  // Actually image shows "00" in top right. If it's a long tournament, mm:ss is better.
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
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

const TypingArena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- State ---
  const [tournament, setTournament] = useState(null);
  const [baseText, setBaseText] = useState(''); // The original single copy of text
  const [fullText, setFullText] = useState(''); // The potentially repeated text

  const [startTime, setStartTime] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Typing State
  const [lockedWords, setLockedWords] = useState([]); // Array of completed words
  const [currentWord, setCurrentWord] = useState(''); // Current word being typed
  const [inputVal, setInputVal] = useState(''); // Raw input for hidden field

  const inputRef = useRef(null);
  const activeWordRef = useRef(null);
  const wordNodesRef = useRef(new Map());

  // --- Effects ---

  // 1. Fetch Tournament Data
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tournaments/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTournament(data);
          const raw = normalizeText(data.customText || "The quick brown fox jumps over the lazy dog.");

          // Pre-fill text to ensure we have enough lines for scrolling effect
          let initialText = raw;
          while (initialText.length < 500) {
            initialText += ' ' + raw;
          }

          setBaseText(raw);
          setFullText(initialText);
        } else {
          console.error("Failed to load tournament");
          navigate('/tournaments');
        }
      } catch (err) {
        console.error("Failed to load tournament text", err);
      }
    };
    fetchTournament();
  }, [id, navigate]);

  // 2. Timer Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // 3. Check End Time
  useEffect(() => {
    if (!tournament || isFinished) return;

    const endDate = new Date(tournament.endDate).getTime();
    if (nowMs >= endDate) {
      finishGame();
    }
  }, [nowMs, tournament, isFinished]);

  // 4. Auto-scroll to active word
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [lockedWords.length]);

  // --- Logic ---

  // Memoized Text Lines
  const testLines = useMemo(() => splitTextIntoFixedLines(fullText, 55), [fullText]);

  const lineStartIndices = useMemo(() => {
    const indices = [0];
    let count = 0;
    testLines.forEach(line => {
      count += line.split(' ').length;
      indices.push(count);
    });
    return indices;
  }, [testLines]);

  const targetWords = useMemo(() => fullText ? fullText.split(' ') : [], [fullText]);

  // Stats Calculation
  const stats = useMemo(() => {
    // Round Duration in minutes (using tournament schedule)
    const start = new Date(tournament?.startDate).getTime();
    const end = new Date(tournament?.endDate).getTime();
    const roundDurationMin = Math.max(1, (end - start) / 60000);

    let correctChars = 0;
    let totalChars = 0;

    // Locked words
    lockedWords.forEach((word, idx) => {
      const target = targetWords[idx] || '';
      const isCorrect = word === target;
      const wordLen = word.length + 1; // +1 for space
      totalChars += wordLen;
      if (isCorrect) correctChars += wordLen;
    });

    // Current word
    if (currentWord) {
      totalChars += currentWord.length;
      const targetIndex = lockedWords.length;
      const target = targetWords[targetIndex] || '';
      let matchLen = 0;
      for (let i = 0; i < currentWord.length; i++) {
        if (i < target.length && currentWord[i] === target[i]) {
          matchLen++;
        } else {
          break;
        }
      }
      correctChars += matchLen;
    }

    // Always use fixed round duration for WPM calculation
    const grossWpm = Math.round((totalChars / 5) / roundDurationMin);
    const netWpm = Math.round((correctChars / 5) / roundDurationMin);
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

    return { netWpm, grossWpm, accuracy };
  }, [lockedWords, currentWord, tournament, targetWords]);

  // Input Handling
  const handleKeyDown = (e) => {
    if (isFinished || !fullText) return;

    // Prevent default actions for keys that might scroll or navigate
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
    }

    if (!startTime) setStartTime(Date.now());

    const key = e.key;

    // Backspace
    if (key === 'Backspace') {
      if (currentWord.length > 0) {
        setCurrentWord(prev => prev.slice(0, -1));
      }
      return;
    }

    // Space (Complete Word)
    if (key === ' ') {
      e.preventDefault();
      if (currentWord.length === 0) return; // Don't allow empty words

      const nextLocked = [...lockedWords, currentWord];
      setLockedWords(nextLocked);
      setCurrentWord('');

      // Check if we need to append more text (Infinite Scroll)
      // If we are within 20 words of the end, append baseText again
      if (nextLocked.length >= targetWords.length - 20) {
        setFullText(prev => prev + ' ' + baseText);
      }
      return;
    }

    // Typing Characters
    if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setCurrentWord(prev => prev + key);
    }
  };

  const finishGame = async () => {
    if (isFinished) return;
    setIsFinished(true);
    setIsSubmitting(true);

    const resultData = {
      userId: user.id || user._id, // Ensure userId is sent
      wpm: stats.netWpm,
      accuracy: stats.accuracy,
      netWpm: stats.netWpm,
      grossWpm: stats.grossWpm
    };

    try {
      await fetch(`${API_BASE_URL}/api/tournaments/${id}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(resultData)
      });
      // Navigate to leaderboard
      navigate(`/tournament/${id}`);
    } catch (err) {
      console.error('Submission failed', err);
      // Even if failed, navigate back
      navigate(`/tournament/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // View Calculation
  const calculateVisibleLines = (activeWordIndex) => {
    let activeLineIndex = 0;
    for (let i = 0; i < lineStartIndices.length - 1; i++) {
      if (activeWordIndex >= lineStartIndices[i] && activeWordIndex < lineStartIndices[i + 1]) {
        activeLineIndex = i;
        break;
      }
    }
    if (activeWordIndex >= lineStartIndices[lineStartIndices.length - 1]) {
      activeLineIndex = testLines.length - 1;
    }

    const ARENA_VISIBLE_LINES = 5;
    const startLine = Math.max(0, activeLineIndex - (ARENA_VISIBLE_LINES - 1));

    const visible = testLines.slice(startLine, startLine + ARENA_VISIBLE_LINES);
    return { visibleLines: visible, startLineIndex: startLine };
  };

  const activeWordIndex = lockedWords.length;
  const { visibleLines, startLineIndex } = calculateVisibleLines(activeWordIndex);

  // Timer Display
  const timeLeft = tournament ? Math.max(0, new Date(tournament.endDate).getTime() - nowMs) : 0;

  // Styles (Double height for split view)
  // Reduced height to fit on screen without being hidden by footer
  const ARENA_HEIGHT = `calc((1.3rem * 1.6 * 5 + 50px) * 2 + 20px)`;

  if (!tournament) return <div className="arena-loading">Loading Arena...</div>;

  return (
    <div className="typing-arena-game">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="card-header">
          <span className="player-name">{user?.username || 'PLAYER'}</span>

          <span className="status-badge">{isFinished ? 'FINISHED' : 'TYPING...'}</span>
        </div>
        {/* Stats - moved to middle */}
        <div className="stats-row-container">
          <StatsRow stats={stats} />
        </div>
        <div className="top-timer">{formatMmSs(timeLeft)}</div>
      </div>

      <div className="arena-main-wrapper" onClick={() => inputRef.current?.focus()}>
        {/* Main Card */}
        <div className="arena-card">

          {/* Split View */}
          <div className="typing-area" style={{ height: ARENA_HEIGHT }}>
            {visibleLines.length > 0 ? (
              <div className="split-container">
                {/* Top: Target Text */}
                <div className="text-section target-section">
                  <TargetTextDisplay
                    visibleLines={visibleLines}
                    startLineIndex={startLineIndex}
                    globalLineStartIndices={lineStartIndices}
                    activeWordIndex={activeWordIndex}
                    lockedWords={lockedWords}
                    currentWord={currentWord}
                    wordNodesRef={wordNodesRef}
                    activeWordRef={activeWordRef}
                  />
                </div>

                {/* Divider */}
                <div className="split-divider"></div>

                {/* Bottom: User Input (Visual) */}
                <div className="text-section input-section">
                  <TypedTextDisplay
                    visibleLines={visibleLines}
                    startLineIndex={startLineIndex}
                    globalLineStartIndices={lineStartIndices}
                    activeWordIndex={activeWordIndex}
                    lockedWords={lockedWords}
                    currentWord={currentWord}
                  />
                </div>
              </div>
            ) : (
              <div className="waiting-text">Preparing text...</div>
            )}
          </div>

          <div className="instructions">
            <Link to={`/tournament/${id}`} className="exit-link">Exit to Leaderboard</Link>
          </div>
        </div>
      </div>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        className="hidden-input"
        autoFocus
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputRef.current?.focus()}
      />

      {/* Styles */}
      <style>{`
        /* Font Import if needed, assuming Roboto Mono or similar is available */
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');

        .typing-arena-game {
            height: 100vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            background: radial-gradient(circle at center, #2a0a4d 0%, #120422 100%); /* Deep Purple Gradient */
            overflow: hidden;
            font-family: 'Roboto Mono', monospace;
            color: #fff;
            position: relative;
        }

        /* Vignette Effect */
        .typing-arena-game::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(transparent 50%, rgba(0,0,0,0.6) 100%);
            pointer-events: none;
            z-index: 1;
        }

        .top-bar {
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 40px;
            z-index: 10;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(138, 92, 255, 0.2);
            height: 80px; /* Fixed height for alignment */
        }

        .round-info {
            font-size: 1.2rem;
            font-weight: 700;
            letter-spacing: 2px;
            color: #fff;
            text-shadow: 0 0 10px rgba(138, 92, 255, 0.5);
        }

        .top-timer {
            font-size: 3rem;
            font-weight: 700;
            color: #d946ef; /* Neon Pink/Purple */
            text-shadow: 0 0 15px #a020f0, 0 0 30px #a020f0;
            font-family: sans-serif; /* Per image, timer looks like sans-serif */
        }

        .arena-main-wrapper {
            flex: 1;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            z-index: 10;
            padding: 40px 20px 20px 20px;
        }

        .arena-card {
            width: 100%;
            max-width: 900px;
            border: 2px solid #8A5CFF; /* Bright Purple Border */
            border-radius: 24px;
            background: rgba(20, 0, 40, 0.4);
            box-shadow: 0 0 20px rgba(138, 92, 255, 0.3), inset 0 0 20px rgba(138, 92, 255, 0.1);
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .player-name {
            font-size: 1.5rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            white-space: nowrap;
        }

        .stats-row-container {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            justify-content: center;
        }

        .status-badge {
            display: none; /* Removed as requested (second uploaded image showed "TYPING..." which is this badge, but user said remove second uploaded image) */
        }

        .stats-row {
            display: flex;
            /* Removed background to make it transparent */
            /* background: rgba(255, 255, 255, 0.05); */
            border-radius: 8px;
            padding: 8px 24px;
            /* Removed border to make it cleaner without background */
            /* border: 1px solid rgba(138, 92, 255, 0.2); */
            gap: 0; 
        }

        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            border-right: 1px solid rgba(255, 255, 255, 0.2);
            padding: 0 32px; /* Increased padding for better spacing without card */
        }
        .stat-item:last-child {
            border-right: none;
        }

        .stat-label {
            font-size: 0.7rem;
            color: #c084fc;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: #fff;
        }

        .typing-area {
            position: relative;
            background: rgba(10, 5, 20, 0.8);
            border: 1px solid rgba(138, 92, 255, 0.3);
            border-radius: 16px;
            padding: 20px;
            font-size: 1.3rem;
            line-height: 1.6;
            overflow: hidden;
            width: 100%;
            box-sizing: border-box;
            box-shadow: inset 0 0 30px rgba(0,0,0,0.8);
        }

        .split-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .text-section {
            flex: 1;
            overflow: hidden;
            position: relative;
            width: 100%;
        }

        .target-section {
            color: rgba(255, 255, 255, 0.8);
            padding-bottom: 24px;
        }

        .split-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.2);
            margin: 10px 0;
            width: 100%;
        }

        .input-section {
            color: #fff;
            padding-top: 10px;
            padding-bottom: 40px;
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

        .instructions {
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
        }

        .exit-link {
            color: #c084fc;
            text-decoration: none;
            margin-top: 8px;
            display: inline-block;
            font-weight: 600;
        }
        .exit-link:hover {
            color: #fff;
            text-decoration: underline;
        }
        
        .waiting-text {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
        }
        
        .arena-loading {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0f0f1a;
            color: #fff;
            font-family: monospace;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
            background: #5b21b6; 
            border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default TypingArena;
