import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

const OneToOneResults = ({
  contest,
  serverResults,
  currentRound,
  totalRounds,
  isBreak,
  breakTime,
  breakEndsAtMs,
  finalWinner,
  isContestFinished,
  myUserId,
  onBack,
  lastSubmittedResult,
  opponentSnapshot,
  myStats,
  opponentStats
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [timeLeft, setTimeLeft] = useState(() => {
    return Number.isFinite(Number(breakTime)) ? Number(breakTime) : 10;
  });

  useEffect(() => {
    if (!breakEndsAtMs) {
        if (Number.isFinite(Number(breakTime))) setTimeLeft(Number(breakTime));
        return;
    }

    const updateTimer = () => {
        const now = Date.now();
        const diff = Math.ceil((breakEndsAtMs - now) / 1000);
        setTimeLeft(Math.max(0, diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [breakEndsAtMs, breakTime]);
  
  const opponentUser = useMemo(() => {
    if (!contest) return null;
    const challenger = contest.challenger;
    const opponent = contest.opponent;
    const cId = String(challenger?._id || challenger || '');
    const oId = String(opponent?._id || opponent || '');
    const myIdStr = String(myUserId || '');
    if (myIdStr && myIdStr === cId) return opponent;
    if (myIdStr && myIdStr === oId) return challenger;
    return opponent;
  }, [contest, myUserId]);

  const isChallenger = useMemo(() => {
    if (!contest || !myUserId) return false;
    const cId = String(contest.challenger?._id || contest.challenger || '');
    const myIdStr = String(myUserId || '');
    return myIdStr === cId;
  }, [contest, myUserId]);

  // Helper to get user name
  const getUserName = (userId, forceRealName = false) => {
    const cId = contest?.challenger?._id || contest?.challenger;
    const oId = contest?.opponent?._id || contest?.opponent;
    
    if (String(userId) === String(cId)) return contest?.challenger?.username || 'Challenger';
    if (String(userId) === String(oId)) return contest?.opponent?.username || 'Opponent';
    
    // Fallback if userId matches myUserId
    if (String(userId) === String(myUserId)) return forceRealName ? (user?.username || 'You') : 'You';
    
    return 'Unknown';
  };

  const roundResults = useMemo(() => {
    // Prioritize serverResults if available and not empty, otherwise fallback to contest.results
    const results = (serverResults?.results && serverResults.results.length > 0) 
        ? serverResults.results 
        : (contest?.results || []);

    const filtered = results.filter(r => Number(r.round) === Number(currentRound));
    
    // If we don't have server results for this round yet, try to use local data
    const myServerRes = filtered.find(r => String(r.user?._id || r.user) === String(myUserId));
    const oppServerRes = filtered.find(r => String(r.user?._id || r.user) !== String(myUserId));
    
    const combined = [...filtered];
    
    // Inject local result if missing from server and matches current round
    if (!myServerRes) {
        if (myStats) {
             combined.push({
                 user: myUserId,
                 netWpm: myStats.netWpm,
                 grossWpm: myStats.grossWpm,
                 accuracy: myStats.accuracy,
                 isLocal: true,
                 round: currentRound
             });
        } else if (lastSubmittedResult && (!lastSubmittedResult.round || Number(lastSubmittedResult.round) === Number(currentRound))) {
            combined.push({
                ...lastSubmittedResult,
                user: myUserId,
                isLocal: true
            });
        }
    }
    
    // Inject opponent snapshot if missing from server
    if (!oppServerRes) {
        const oppId = opponentUser?._id || opponentUser || 'opponent';
        if (opponentStats) {
             combined.push({
                 user: oppId,
                 netWpm: opponentStats.netWpm,
                 grossWpm: opponentStats.grossWpm,
                 accuracy: opponentStats.accuracy,
                 isLocal: true,
                 round: currentRound
             });
        } else if (opponentSnapshot) {
             const chars = Number(opponentSnapshot.completedChars || 0);
             const correct = Number(opponentSnapshot.completedCorrectChars || 0);
             const durationSec = Number(contest?.durationSec || 60);
             const timeMin = durationSec / 60;
             
             const grossWpm = timeMin > 0 ? Math.round((chars / 5) / timeMin) : 0;
             const netWpm = timeMin > 0 ? Math.round((correct / 5) / timeMin) : 0;
             const accuracy = chars > 0 ? Math.round((correct / chars) * 100) : 0;
    
             combined.push({
                 user: oppId,
                 netWpm,
                 grossWpm,
                 accuracy,
                 isLocal: true
             });
        }
    }
    
    return combined;
  }, [serverResults, contest, currentRound, lastSubmittedResult, myUserId, opponentSnapshot, opponentUser, myStats, opponentStats]);

  const myResult = roundResults.find(r => String(r.user?._id || r.user) === String(myUserId));
  const opponentResult = roundResults.find(r => String(r.user?._id || r.user) !== String(myUserId));
  
  // Helper to determine round winner
  const getRoundWinnerId = () => {
    if (!myResult || !opponentResult) return null;
    if (myResult.netWpm > opponentResult.netWpm) return myResult.user?._id || myResult.user;
    if (opponentResult.netWpm > myResult.netWpm) return opponentResult.user?._id || opponentResult.user;
    // Tie breaker? Accuracy?
    if (myResult.accuracy > opponentResult.accuracy) return myResult.user?._id || myResult.user;
    if (opponentResult.accuracy > myResult.accuracy) return opponentResult.user?._id || opponentResult.user;
    return null;
  };

  const roundWinnerId = getRoundWinnerId();
  const iWonRound = String(roundWinnerId) === String(myUserId);
  const isDraw = myResult && opponentResult && !roundWinnerId;

  // Use local calculation for immediate feedback if server result is pending
  const isProjectedWinner = !roundWinnerId && myResult && opponentResult; 
  const projectedWinnerId = isProjectedWinner ? (
      (myResult.netWpm > opponentResult.netWpm) ? myUserId :
      (opponentResult.netWpm > myResult.netWpm) ? (opponentResult.user?._id || opponentResult.user) : null
  ) : null;
  
  const displayWinnerId = roundWinnerId || projectedWinnerId;
  const displayIWon = String(displayWinnerId) === String(myUserId);

  // --- PROJECTED CONTEST WINNER LOGIC (Immediate Final Result) ---
  const allRoundResults = useMemo(() => {
     // Prioritize serverResults if available and not empty, otherwise fallback to contest.results
     const results = (serverResults?.results && serverResults.results.length > 0) 
         ? serverResults.results 
         : (contest?.results || []);
         
     return Array.from({ length: totalRounds }).map((_, i) => {
        const roundNum = i + 1;
        // For current round, use our combined 'roundResults' which includes local data
        let rResults;
        if (roundNum === Number(currentRound)) {
            rResults = roundResults;
        } else {
            rResults = results.filter(r => Number(r.round) === roundNum);
        }
        
        const myRes = rResults.find(r => String(r.user?._id || r.user) === String(myUserId));
        const oppRes = rResults.find(r => String(r.user?._id || r.user) !== String(myUserId));
        
        // Determine winner for this round
        let winnerId = null;
        let winnerName = '-';
        if (myRes && oppRes) {
            if (myRes.netWpm > oppRes.netWpm) winnerId = myUserId;
            else if (oppRes.netWpm > myRes.netWpm) winnerId = oppRes.user?._id || oppRes.user;
            else if (myRes.accuracy > oppRes.accuracy) winnerId = myUserId;
            else if (oppRes.accuracy > myRes.accuracy) winnerId = oppRes.user?._id || oppRes.user;
        } else if (myRes && !oppRes) {
             winnerId = myUserId; 
        }

        if (winnerId) {
             winnerName = getUserName(winnerId);
        }

        return {
            round: roundNum,
            myRes,
            oppRes,
            winnerId,
            winnerName
        };
     });
  }, [serverResults, contest, totalRounds, myUserId, roundResults, currentRound, user]);

  const projectedContestWinnerId = useMemo(() => {
      if (finalWinner) return finalWinner;
      
      let myWins = 0;
      let oppWins = 0;
      let myTotalWpm = 0;
      let oppTotalWpm = 0;
      
      allRoundResults.forEach(r => {
          if (String(r.winnerId) === String(myUserId)) myWins++;
          else if (r.winnerId) oppWins++;
          
          if (r.myRes) myTotalWpm += (r.myRes.netWpm || 0);
          if (r.oppRes) oppTotalWpm += (r.oppRes.netWpm || 0);
      });

      if (myWins > oppWins) return myUserId;
      if (oppWins > myWins) return opponentUser?._id || opponentUser || 'opponent';
      
      if (myTotalWpm > oppTotalWpm) return myUserId;
      if (oppTotalWpm > myTotalWpm) return opponentUser?._id || opponentUser || 'opponent';
      
      return null;
  }, [finalWinner, allRoundResults, myUserId, opponentUser]);

  // Final Contest Stats
  const isFinal = Boolean(
      isContestFinished || 
      finalWinner || 
      contest?.status === 'Completed' || 
      (Number(currentRound) >= Number(totalRounds) && projectedContestWinnerId)
  );
  
  const displayFinalWinnerId = finalWinner || projectedContestWinnerId;
  const iWonContest = String(displayFinalWinnerId) === String(myUserId);

  const winnerName = displayFinalWinnerId ? getUserName(displayFinalWinnerId, true) : 'No Winner (Draw)';
  
  // Helper to determine round winner name
  const getRoundWinnerName = () => {
     if (isDraw) return 'Draw';
     return getUserName(displayWinnerId, true) || 'Opponent';
  };
  const roundWinnerName = getRoundWinnerName();

  const entryFee = Number(contest?.entryFee || 0);
  const totalPool = entryFee * 2;
  const winnerPrize = totalPool * 0.70;
  const championBonus = totalPool * 0.10;

  // Refs to track if we've already celebrated to prevent multiple bursts
  const celebratedRound = useRef(null);
  const celebratedFinal = useRef(false);

  // Trigger confetti if I won the round or the contest, or if it's the final result page
  useEffect(() => {
    // Determine what we should celebrate right now
    const shouldCelebrateFinal = isFinal && iWonContest;
    const shouldCelebrateRound = !isFinal && iWonRound;
    
    let timeouts = [];

    // Helper for bursts
    const fireBursts = (particleCount = 100) => {
        // Fire confetti from left
        confetti({
          particleCount,
          spread: 80,
          gravity: 4, // Make them fall fast
          ticks: 100, // Short life
          origin: { x: 0.1, y: 0.6 },
          angle: 60,
          zIndex: 2000
        });
        // Fire confetti from right
        confetti({
          particleCount,
          spread: 80,
          gravity: 4, // Make them fall fast
          ticks: 100, // Short life
          origin: { x: 0.9, y: 0.6 },
          angle: 120,
          zIndex: 2000
        });
        // Fire confetti from center
        confetti({
          particleCount: particleCount + 50,
          spread: 120,
          gravity: 4, // Make them fall fast
          ticks: 100, // Short life
          origin: { x: 0.5, y: 0.6 },
          angle: 90,
          zIndex: 2000
        });
    };

    if (shouldCelebrateFinal && !celebratedFinal.current) {
        celebratedFinal.current = true;
        fireBursts(100);
        timeouts.push(setTimeout(() => fireBursts(150), 300));
    } else if (shouldCelebrateRound && celebratedRound.current !== currentRound) {
        celebratedRound.current = currentRound;
        fireBursts(100);
    }

    return () => {
        timeouts.forEach(t => clearTimeout(t));
        // Do not reset confetti here to avoid clearing it during re-renders. 
        // We reset it on navigation instead.
    };
  }, [iWonContest, iWonRound, isFinal, currentRound]);

  // Generate random balls for background animation
  const balls = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => {
      // Determine position zone
      const r = Math.random();
      let left, top;
      
      if (r < 0.4) {
        // 40% Left Side (Spread evenly 0-35%)
        left = Math.random() * 35;
        top = Math.random() * 100;
      } else if (r < 0.8) {
        // 40% Right Side (Spread evenly 65-100%)
        left = 65 + Math.random() * 35;
        top = Math.random() * 100;
      } else if (r < 0.9) {
        // 10% Top (Spread evenly 0-100% width, 0-15% height)
        left = Math.random() * 100;
        top = Math.random() * 15;
      } else {
        // 10% Bottom (Spread evenly 0-100% width, 85-100% height)
        left = Math.random() * 100;
        top = 85 + Math.random() * 15;
      }

      return {
        id: i,
        size: Math.random() * 8 + 6, // 6px to 14px
        left,
        top,
        color: ['#FF0000', '#0000FF', '#FFFF00', '#ff9a9e', '#fad0c4', '#a18cd1', '#fbc2eb', '#FF00FF', '#FF8800',  '#0088FF', '#FF0088'][Math.floor(Math.random() * 11)],
        duration: Math.random() * 20 + 10, // 10s to 30s
        delay: Math.random() * -30 // Start at random times
      };
    });
  }, []);

  // Shared Styles
  const styles = `
    @keyframes wander {
        0% { transform: translate(0, 0) rotate(0deg); }
        20% { transform: translate(40px, -40px) rotate(45deg); }
        40% { transform: translate(-20px, 60px) rotate(90deg); }
        60% { transform: translate(60px, 20px) rotate(135deg); }
        80% { transform: translate(-40px, -60px) rotate(180deg); }
        100% { transform: translate(0, 0) rotate(360deg); }
    }
    .floating-ball {
        position: absolute;
        border-radius: 50%;
        opacity: 0.8;
        animation: wander infinite ease-in-out alternate;
        z-index: 0;
    }
    @keyframes electricShine {
        0% { background-position: -150% center; }
        100% { background-position: 150% center; }
    }
    @keyframes popIn {
        0% { opacity: 0; transform: scale(0.5); }
        100% { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    @keyframes pulseGlow {
        0% { box-shadow: 0 10px 30px rgba(123, 31, 162, 0.2); transform: scale(1); }
        50% { box-shadow: 0 20px 50px rgba(123, 31, 162, 0.5); transform: scale(1.02); }
        100% { box-shadow: 0 10px 30px rgba(123, 31, 162, 0.2); transform: scale(1); }
    }
    @keyframes floatPopper {
        0% { transform: translateY(0) scale(1) rotate(0deg); filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2)); }
        50% { transform: translateY(-10px) scale(1.1) rotate(5deg); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3)); }
        100% { transform: translateY(0) scale(1) rotate(0deg); filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2)); }
    }
    @keyframes floatPopperReverse {
        0% { transform: scaleX(-1) translateY(0) scale(1) rotate(0deg); filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2)); }
        50% { transform: scaleX(-1) translateY(-10px) scale(1.1) rotate(-5deg); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3)); }
        100% { transform: scaleX(-1) translateY(0) scale(1) rotate(0deg); filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2)); }
    }
    .main-card {
        background: linear-gradient(-45deg, #ff9a9e, #fad0c4, #a18cd1, #fbc2eb, #8fd3f4);
        background-size: 400% 400%;
        border-radius: 24px;
        padding: 20px 15px;
        width: 100%;
        maxWidth: 350px;
        min-height: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, pulseGlow 3s infinite ease-in-out, gradientBG 10s ease infinite;
        border: 2px solid rgba(255, 255, 255, 0.5);
    }
    .animated-background {
        background: linear-gradient(-45deg, #ff9a9e, #fad0c4, #a18cd1, #fbc2eb, #8fd3f4);
        background-size: 400% 400%;
        animation: gradientBG 10s ease infinite;
        min-height: 85vh;
        width: 100%;
        max-width: 1100px;
        border-radius: 30px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: 'Inter', sans-serif;
        position: relative;
        overflow: hidden;
    }
    .round-card {
        background: #fff;
        border-radius: 16px;
        padding: 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        flex: 1 1 250px;
        max-width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .winner-badge {
        padding: 8px 24px;
        border-radius: 20px;
        color: white;
        font-weight: bold;
        margin-top: 15px;
        font-size: 14px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .winner-bg {
        /* Kept for backward compatibility if needed, but main-card now has the styles */
    }
    .electric-text {
        background: linear-gradient(
            110deg, 
            #4a148c 45%, 
            #ffffff 50%, 
            #4a148c 55%
        );
        background-size: 250% auto;
        color: #4a148c;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: electricShine 3s linear infinite;
        filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.6));
    }
    .stat-box {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 16px;
        padding: 40px 10px;
        min-height: 220px;
        width: 70px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.5);
        transition: transform 0.2s;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    .stat-box:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .timer-badge {
        background: #fff;
        color: #1565c0;
        padding: 10px 30px;
        border-radius: 50px;
        font-family: monospace;
        font-size: 32px;
        font-weight: 900;
        margin-bottom: 30px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        border: 2px solid #e3f2fd;
        animation: pulseGlow 2s infinite ease-in-out;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      
      <div style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#f8faff', position: 'relative', overflow: 'hidden' }}>
          {/* Background Wandering Balls */}
          {balls.map(ball => (
              <div 
                  key={ball.id}
                  className="floating-ball"
                  style={{
                      width: `${ball.size}px`,
                      height: `${ball.size}px`,
                      left: `${ball.left}%`,
                      top: `${ball.top}%`,
                      background: ball.color,
                      animationDuration: `${ball.duration}s`,
                      animationDelay: `${ball.delay}s`
                  }}
              />
          ))}

          <div className="animated-background" style={{ zIndex: 10 }}>
            
            {/* Header Section - Same for both */}
            <div style={{ fontSize: '60px', marginBottom: '5px', marginTop: '0px', animation: 'floatPopper 3s infinite ease-in-out' }}>🏆</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '5px' }}>
                <div style={{ fontSize: '48px', animation: 'floatPopper 2s infinite ease-in-out' }}>🎉</div>
                <h1 className="electric-text" style={{ fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', color: 'white', margin: 0 }}>
                    CONGRATULATIONS
                </h1>
                <div style={{ fontSize: '48px', animation: 'floatPopperReverse 2s infinite ease-in-out' }}>🎉</div>
            </div>
            
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#1565c0', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 2px 4px rgba(255,255,255,0.5)' }}>
                WINNER: <span style={{ color: '#0d47a1', textDecoration: 'underline' }}>{(isFinal ? winnerName : roundWinnerName).toUpperCase()}</span>
            </div>

            {/* Content Switch based on isFinal */}
            {isFinal ? (
                <>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#4a148c', marginBottom: '10px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(255,255,255,0.5)' }}>
                        {totalRounds} Round Results
                    </h2>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', width: '100%', maxWidth: '1200px', marginBottom: '10px', marginTop: '20px' }}>
                        {allRoundResults.map((roundResult, idx) => {
                            const leftRes = isChallenger ? roundResult.myRes : roundResult.oppRes;
                            const rightRes = isChallenger ? roundResult.oppRes : roundResult.myRes;
                            const leftName = isChallenger ? (user?.username || 'You') : (opponentUser?.username || 'Challenger');
                            const rightName = isChallenger ? (opponentUser?.username || 'Opponent') : (user?.username || 'You');

                            return (
                            <div key={idx} className="round-card" style={{ padding: '10px' }}>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#4a148c', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    ROUND {roundResult.round}
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '5px' }}>
                                     {/* Left Stats (Challenger Side) */}
                                     <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#7b1fa2', marginBottom: '4px' }}>{leftName}</div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#4a148c' }}>{leftRes?.netWpm ?? '-'}</div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#4a148c', marginTop: '2px' }}>NET WPM</div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#4a148c', marginTop: '2px' }}>Net Speed: {leftRes?.netWpm ?? 0}</div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#4a148c', marginTop: '2px' }}>Acc: {leftRes?.accuracy || 0}%</div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#4a148c', marginTop: '2px' }}>Gross: {leftRes?.grossWpm || 0}</div>
                                     </div>

                                     <div style={{ fontSize: '14px', fontWeight: 900, color: '#7b1fa2' }}>VS</div>

                                     {/* Right Stats (Opponent Side) */}
                                     <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#7b1fa2', marginBottom: '4px' }}>{rightName}</div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#4a148c' }}>{rightRes?.netWpm ?? '-'}</div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#4a148c', marginTop: '2px' }}>NET WPM</div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#4a148c', marginTop: '2px' }}>Net Speed: {rightRes?.netWpm ?? 0}</div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#4a148c', marginTop: '2px' }}>Acc: {rightRes?.accuracy || 0}%</div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#4a148c', marginTop: '2px' }}>Gross: {rightRes?.grossWpm || 0}</div>
                                     </div>
                                </div>

                                <div className="winner-badge" style={{ 
                                    background: '#d32f2f',
                                    color: '#ffffff',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 4px 10px rgba(211, 47, 47, 0.4)',
                                    letterSpacing: '1px',
                                    padding: '5px 15px',
                                    fontSize: '12px',
                                    marginTop: '8px'
                                }}>
                                    WINNER: {roundResult.winnerId ? (String(roundResult.winnerId) === String(myUserId) ? 'YOU' : (roundResult.winnerName || 'OPPONENT')) : '-'}
                                </div>
                            </div>
                            );
                        })}
                    </div>

                    {/* Prize Pool Distribution (Only for Paid Contests) */}
                    {totalPool > 0 && (
                        <div style={{ 
                            width: '100%', 
                            maxWidth: '400px', 
                            background: 'white', 
                            borderRadius: '15px', 
                            padding: '12px', 
                            marginBottom: '10px', 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '16px' }}>💰</span>
                                <h3 style={{ margin: 0, textAlign: 'center', color: '#673ab7', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Prize Pool Distribution
                                </h3>
                                <span style={{ fontSize: '16px' }}>💰</span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '14px', fontWeight: '800', color: '#333', padding: '8px', background: '#f5f5f5', borderRadius: '8px' }}>
                                <span>Total Pool</span>
                                <span style={{ color: '#673ab7' }}>{totalPool.toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'grid', gap: '6px' }}>
                                <div style={{ background: 'linear-gradient(to right, #e8f5e9, #c8e6c9)', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1b5e20', fontWeight: '700', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>🥇</span>
                                        <span style={{ fontSize: '12px' }}>Winner Prize (70%)</span>
                                    </div>
                                    <span style={{ fontSize: '14px' }}>{winnerPrize.toFixed(2)}</span>
                                </div>
                                
                                <div style={{ background: 'linear-gradient(to right, #fffde7, #fff9c4)', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f57f17', fontWeight: '700', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>🏅</span>
                                        <span style={{ fontSize: '12px' }}>Champion Award (10%)</span>
                                    </div>
                                    <span style={{ fontSize: '14px' }}>{championBonus.toFixed(2)}</span>
                                </div>
                                
                                <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#757575', fontWeight: '600', borderTop: '1px solid #eee', marginTop: '2px' }}>
                                    <span>Platform Fee (20%)</span>
                                    <span>{(totalPool * 0.20).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{ 
                            padding: '10px 30px', 
                            background: '#aa00ff', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '30px', 
                            fontWeight: 'bold', 
                            fontSize: '16px', 
                            cursor: 'pointer',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            transition: 'transform 0.2s',
                            marginBottom: '10px',
                            marginTop: '50px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Back to Dashboard
                    </button>
                </>
            ) : (
                <>
                    {/* Intermediate Round Content */}
                     <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#4a148c', marginBottom: '10px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(255,255,255,0.5)' }}>
                        Round {currentRound} Results
                    </h2>

                    <div className="round-card" style={{ transform: 'scale(1.0)', marginBottom: '15px', width: '500px', maxWidth: '90%', padding: '15px', marginTop: '20px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#4a148c', marginBottom: '10px', textTransform: 'uppercase' }}>
                            ROUND {currentRound}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                {/* Left Stats (Challenger Side) */}
                                <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#7b1fa2', marginBottom: '4px' }}>
                                    {isChallenger ? (user?.username || 'You') : (opponentUser?.username || 'Challenger')}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#4a148c' }}>
                                    {(isChallenger ? myResult?.netWpm : opponentResult?.netWpm) ?? '-'}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#4a148c', marginTop: '5px' }}>NET WPM</div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#4a148c', marginTop: '5px' }}>
                                    Net Speed: {(isChallenger ? myResult?.netWpm : opponentResult?.netWpm) ?? 0}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#4a148c', marginTop: '5px' }}>
                                    Acc: {(isChallenger ? myResult?.accuracy : opponentResult?.accuracy) || 0}%
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#4a148c', marginTop: '5px' }}>
                                    Gross: {(isChallenger ? myResult?.grossWpm : opponentResult?.grossWpm) || 0}
                                </div>
                                </div>

                                <div style={{ fontSize: '18px', fontWeight: 900, color: '#7b1fa2' }}>VS</div>

                                {/* Right Stats (Opponent Side) */}
                                <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#7b1fa2', marginBottom: '4px' }}>
                                    {isChallenger ? (opponentUser?.username || 'Opponent') : (user?.username || 'You')}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#4a148c' }}>
                                    {(isChallenger ? opponentResult?.netWpm : myResult?.netWpm) ?? '-'}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#4a148c', marginTop: '5px' }}>NET WPM</div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#4a148c', marginTop: '5px' }}>
                                    Net Speed: {(isChallenger ? opponentResult?.netWpm : myResult?.netWpm) ?? 0}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#4a148c', marginTop: '5px' }}>
                                    Acc: {(isChallenger ? opponentResult?.accuracy : myResult?.accuracy) || 0}%
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#4a148c', marginTop: '5px' }}>
                                    Gross: {(isChallenger ? opponentResult?.grossWpm : myResult?.grossWpm) || 0}
                                </div>
                                </div>
                        </div>

                        <div className="winner-badge" style={{ 
                            background: '#d32f2f',
                            color: '#ffffff',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 10px rgba(211, 47, 47, 0.4)',
                            letterSpacing: '1px',
                            marginTop: '10px'
                        }}>
                            WINNER: {roundWinnerId ? (String(roundWinnerId) === String(myUserId) ? 'YOU' : (roundWinnerName || 'OPPONENT')) : '-'}
                        </div>
                    </div>

                    <div style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        padding: '10px 30px', 
                        borderRadius: '50px', 
                        border: '2px solid white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px'
                    }}>
                        <div style={{ color: 'white', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>
                            {timeLeft <= 0 ? 'Wait' : 'Next Round Starting In'}
                        </div>
                        <div style={{ color: 'white', fontSize: '32px', fontWeight: '900', fontFamily: 'monospace' }}>
                             {timeLeft <= 0 ? 'STARTING...' : `00:${String(timeLeft).padStart(2, '0')}`}
                        </div>
                    </div>
                </>
            )}

          </div>
      </div>
    </>
  );
};

export default OneToOneResults;
