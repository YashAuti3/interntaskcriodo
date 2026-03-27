import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/ToastContext';
import { useTheme } from '../components/ThemeContext';
import {
  generateUniqueNumbers,
  buildCards,
  reshuffleUnmatched,
  checkMatch,
  checkWin,
} from '../utils/gameLogic';
import { deductBalance, addBalance, addHistoryEntry, getUserByEmail } from '../utils/localStorage';

// ── Constants ──────────────────────────────────────────────────────────────
const MAX_BET      = 5000;
const WIN_MULT     = 3;
const SHUFFLE_MIN  = 3000;
const SHUFFLE_MAX  = 5000;
const FLIP_BACK_MS = 900;

// ── Sound Helpers ──────────────────────────────────────────────────────────
const playTone = (freq, dur, type = 'sine', vol = 0.15) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.start();
    osc.stop(ctx.currentTime + dur / 1000);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000);
  } catch (_) {}
};
const soundMatch = () => { playTone(523, 120); setTimeout(() => playTone(659, 120), 130); setTimeout(() => playTone(784, 200), 260); };
const soundWrong = () => { playTone(200, 250, 'sawtooth'); };
const soundWin   = () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 200), i * 120)); };

const PHASE = { BET: 'bet', PLAYING: 'playing', WON: 'won', LOST: 'lost' };

export default function Game() {
  const { user, refreshUser } = useAuth();
  const { setNavbarHidden } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [betInput, setBetInput] = useState('');
  const [betError, setBetError] = useState('');

  const [phase, setPhase]       = useState(PHASE.BET);
  const [row1, setRow1]         = useState([]);
  const [row2, setRow2]         = useState([]);
  const [selected1, setSelected1] = useState(null);
  const [selected2, setSelected2] = useState(null);
  const [wrongIds, setWrongIds]   = useState([]);
  const [mistakes, setMistakes]   = useState(0);
  const [bet, setBet]             = useState(0);
  const [locked, setLocked]       = useState(false);

  const [shuffleIn, setShuffleIn]   = useState(SHUFFLE_MAX);
  const shuffleTimerRef             = useRef(null);
  const countdownRef                = useRef(null);
  const shuffleIntervalMs           = useRef(SHUFFLE_MAX);

  const startGame = () => {
    const amount = Number(betInput);
    if (!betInput || isNaN(amount) || amount <= 0) { setBetError('Enter a valid bet amount'); return; }
    if (amount > MAX_BET)                          { setBetError(`Maximum bet is ₹${MAX_BET}`); return; }
    const fresh = getUserByEmail(user.email);
    if ((fresh?.balance ?? user.balance) < amount) { setBetError('Insufficient balance'); return; }

    const ok = deductBalance(user.email, amount);
    if (!ok) { setBetError('Failed to deduct balance'); return; }
    refreshUser(user.email);

    const nums = generateUniqueNumbers(5);
    const { row1: r1, row2: r2 } = buildCards(nums);
    setRow1(r1); setRow2(r2);
    setSelected1(null); setSelected2(null);
    setWrongIds([]); setLocked(false);
    setMistakes(0);
    setBet(amount);
    setPhase(PHASE.PLAYING);
    toast(`Game started! Bet: ₹${amount}`, 'info');
    scheduleAutoShuffle(r1, r2);
  };

  const scheduleAutoShuffle = useCallback((r1Snap, r2Snap) => {
    clearTimeout(shuffleTimerRef.current);
    clearInterval(countdownRef.current);
    const interval = SHUFFLE_MIN + Math.random() * (SHUFFLE_MAX - SHUFFLE_MIN);
    shuffleIntervalMs.current = interval;
    setShuffleIn(Math.ceil(interval / 1000));

    let remaining = Math.ceil(interval / 1000);
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setShuffleIn(remaining > 0 ? remaining : 1);
    }, 1000);

    shuffleTimerRef.current = setTimeout(() => {
      clearInterval(countdownRef.current);
      setRow1(prev => prev.map(c => !c.isMatched ? { ...c, isFlipped: false } : c));
      setRow2(prev => prev.map(c => !c.isMatched ? { ...c, isFlipped: false } : c));
      setSelected1(null); setSelected2(null);

      setTimeout(() => {
        let nextR1, nextR2;
        setRow1(prev => { nextR1 = reshuffleUnmatched(prev, prev).row1; return nextR1; });
        setRow2(prev => {
          nextR2 = reshuffleUnmatched(prev, prev).row2;
          setTimeout(() => scheduleAutoShuffle(nextR1, nextR2), 0);
          return nextR2;
        });
      }, 400);
    }, interval);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(shuffleTimerRef.current);
      clearInterval(countdownRef.current);
      setNavbarHidden(false);
    };
  }, [setNavbarHidden]);

  useEffect(() => {
    setNavbarHidden(phase === PHASE.PLAYING);
  }, [phase, setNavbarHidden]);

  const handleRow1Click = (card) => {
    if (locked || phase !== PHASE.PLAYING || card.isMatched) return;
    if (selected1?.id === card.id) { setSelected1(null); return; }
    setRow1(prev => prev.map(c => c.id === card.id ? { ...c, isFlipped: true } : c));
    setSelected1(card);
  };

  const handleRow2Click = (card) => {
    if (locked || phase !== PHASE.PLAYING || card.isMatched) return;
    if (!selected1) { toast('Pick a card from Row 1 first!', 'warning'); return; }
    if (selected2?.id === card.id) { setSelected2(null); return; }

    clearTimeout(shuffleTimerRef.current);
    clearInterval(countdownRef.current);

    const flippedCard = { ...card, isFlipped: true };
    setRow2(prev => prev.map(c => c.id === card.id ? { ...c, isFlipped: true } : c));
    setSelected2(flippedCard);
    setTimeout(() => evaluateMatch(selected1, flippedCard), 300);
  };

  const evaluateMatch = (c1, c2) => {
    if (checkMatch(c1, c2)) {
      soundMatch();
      setRow1(prev => prev.map(c => c.number === c1.number ? { ...c, isMatched: true, isFlipped: true } : c));
      setRow2(prev => prev.map(c => c.number === c2.number ? { ...c, isMatched: true, isFlipped: true } : c));
      setSelected1(null); setSelected2(null);

      setRow1(prev => {
        if (checkWin(prev)) {
          handleWin(); return prev;
        } else {
          const resR1 = reshuffleUnmatched(prev, prev).row1;
          setRow2(prev2 => {
            const resR2 = reshuffleUnmatched(prev2, prev2).row2;
            setTimeout(() => scheduleAutoShuffle(resR1, resR2), 0);
            return resR2;
          });
          return resR1;
        }
      });
    } else {
      soundWrong();
      setWrongIds([c1.id, c2.id]);
      setLocked(true);

      setMistakes(prevM => {
        const newM = prevM + 1;
        setTimeout(() => {
          if (newM >= 3) { handleLoss(); return; }
          setRow1(prev => prev.map(c => c.id === c1.id && !c.isMatched ? { ...c, isFlipped: false } : c));
          setRow2(prev => prev.map(c => c.id === c2.id && !c.isMatched ? { ...c, isFlipped: false } : c));
          setWrongIds([]);
          setSelected1(null); setSelected2(null);

          setTimeout(() => {
            setRow1(prev => {
              const resR1 = reshuffleUnmatched(prev, prev).row1;
              setRow2(prev2 => {
                const resR2 = reshuffleUnmatched(prev2, prev2).row2;
                setTimeout(() => scheduleAutoShuffle(resR1, resR2), 0);
                return resR2;
              });
              return resR1;
            });
            setLocked(false);
          }, 400);
        }, FLIP_BACK_MS);
        return newM;
      });
    }
  };

  const handleLoss = () => {
    clearTimeout(shuffleTimerRef.current);
    clearInterval(countdownRef.current);
    addHistoryEntry(user.email, { bet, reward: 0, result: 'lost' });
    setPhase(PHASE.LOST);
    toast('Game over! 3 mistakes made.', 'error', 5000);
  };

  const handleWin = () => {
    clearTimeout(shuffleTimerRef.current);
    clearInterval(countdownRef.current);
    const reward = bet * WIN_MULT;
    addBalance(user.email, reward);
    refreshUser(user.email);
    addHistoryEntry(user.email, { bet, reward, result: 'win' });
    soundWin();
    setPhase(PHASE.WON);
    toast(`You won ₹${reward}! 🎉`, 'success', 5000);
  };

  const handleQuit = () => {
    clearTimeout(shuffleTimerRef.current);
    clearInterval(countdownRef.current);
    addHistoryEntry(user.email, { bet, reward: 0, result: 'lost' });
    setPhase(PHASE.LOST);
    toast(`You forfeited. Bet of ₹${bet} lost.`, 'error');
  };

  const resetGame = () => {
    clearTimeout(shuffleTimerRef.current);
    clearInterval(countdownRef.current);
    setBetInput(''); setBetError('');
    setRow1([]); setRow2([]);
    setSelected1(null); setSelected2(null);
    setWrongIds([]); setLocked(false);
    setMistakes(0); setBet(0);
    setPhase(PHASE.BET);
  };

  const matchedCount = row1.filter(c => c.isMatched).length;
  const timerPct     = (shuffleIn / Math.ceil(shuffleIntervalMs.current / 1000)) * 100;

  // ── Win / Loss overlay ─────────────────────────────────────────────────
  const renderOverlay = () => {
    const won = phase === PHASE.WON;
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center"
        role="dialog" aria-modal="true"
      >
        {/* Glow */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
          <div className={`w-80 h-80 rounded-full blur-3xl opacity-40
            ${won ? 'bg-emerald-500' : 'bg-red-600'}`} />
        </div>

        <div className="relative card p-10 text-center max-w-sm w-[90%] animate-in zoom-in-90 duration-300">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent
            via-white/30 to-transparent" />

          <div className="text-7xl mb-5">{won ? '🏆' : '💀'}</div>
          <h2 className={`text-3xl font-bold mb-2
            ${won ? 'text-emerald-400' : 'text-red-400'}`}>
            {won ? 'You Won!' : 'Game Over'}
          </h2>
          <p className="text-slate-400 mb-4">
            {won ? 'You matched all 5 pairs!' : 'Better luck next time.'}
          </p>

          <div className={`text-4xl font-extrabold mb-8 font-display
            ${won ? 'text-emerald-400' : 'text-red-400'}`}>
            {won ? `+₹${bet * WIN_MULT}` : `-₹${bet}`}
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button className="btn btn-primary btn-lg" onClick={resetGame}>🎮 Play Again</button>
            <button className="btn btn-ghost"           onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
          </div>
        </div>
      </div>
    );
  };

  // ── BET PHASE ──────────────────────────────────────────────────────────
  if (phase === PHASE.BET) {
    return (
      <div className="py-8 pb-16">
        <div className="max-w-xl mx-auto px-5">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 text-white text-xl font-black mb-5"
                 style={{ borderRadius: 5 }}>
              CB
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Card Match</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Match all 5 pairs to win{' '}
              <strong className="text-amber-600 dark:text-amber-400 font-bold">3×</strong> your bet
            </p>
          </div>

          {/* Bet card */}
          <div className="card p-7 mb-5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">💰 Place Your Bet</h2>

            {/* Quick bets */}
            <div className="flex gap-2 flex-wrap mb-5">
              {[100, 250, 500, 1000, 2500].map(q => (
                <button
                  key={q}
                  className={`btn btn-sm ${betInput === String(q) ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => { setBetInput(String(q)); setBetError(''); }}
                >
                  ₹{q}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 mb-2">
              <label className="form-label">Custom amount (max ₹{MAX_BET})</label>
              <input
                id="bet-amount"
                type="number"
                min="1"
                max={MAX_BET}
                className={`form-input ${betError ? 'error' : ''}`}
                placeholder="Enter bet amount…"
                value={betInput}
                onChange={e => { setBetInput(e.target.value); setBetError(''); }}
                onKeyDown={e => e.key === 'Enter' && startGame()}
              />
              {betError && <span className="text-xs text-red-400">{betError}</span>}
            </div>

            {/* Balance & potential win */}
            <div className="py-3 px-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-xl mb-6 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Balance: <strong className="text-amber-600 dark:text-amber-300">₹{Number(user?.balance || 0).toLocaleString('en-IN')}</strong></span>
              {betInput && !isNaN(Number(betInput)) && Number(betInput) > 0 && (
                <span>Win: <strong className="text-emerald-400">₹{(Number(betInput) * WIN_MULT).toLocaleString('en-IN')}</strong></span>
              )}
            </div>

            <button id="start-game-btn" className="btn btn-primary btn-lg btn-full btn-shimmer" onClick={startGame}>
              🎮 Start Game
            </button>
          </div>

          {/* How to play */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              📖 How to Play
            </h3>
            <div className="flex flex-col gap-3">
              {[
                ['1', 'Cards are shuffled into 2 rows of 5'],
                ['2', 'Click a card in Row 1 to flip it'],
                ['3', 'Click its matching number in Row 2'],
                ['4', 'Match all 5 pairs to win 3× your bet'],
                ['⚠️', 'Unmatched cards auto-shuffle every 3–5s!'],
              ].map(([n, t]) => (
                <div key={n} className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30
                                   text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {n}
                  </span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING PHASE ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-6 pb-16">
      {(phase === PHASE.WON || phase === PHASE.LOST) && renderOverlay()}

      <div className="max-w-xl mx-auto px-4">

        {/* Status bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Card Match</h1>
          <button className="btn btn-danger btn-sm" onClick={handleQuit}>❌ Forfeit</button>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap mb-5">
          <span className="badge badge-gold">Bet: ₹{bet}</span>
          <span className="badge badge-green">Win: ₹{bet * WIN_MULT}</span>
          <span className="badge badge-blue">Matched: {matchedCount}/5</span>
          <span className="badge badge-red">Mistakes: {mistakes}/3</span>
        </div>

        {/* Mistake hearts */}
        <div className="flex gap-1.5 mb-5">
          {[0,1,2].map(i => (
            <span key={i} className={`text-xl transition-all duration-300 ${i < mistakes ? 'grayscale opacity-30' : ''}`}>
              ❤️
            </span>
          ))}
          <span className="text-xs text-slate-500 ml-2 self-center">{3 - mistakes} lives left</span>
        </div>

        {/* Shuffle timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>⏱ Next shuffle</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{shuffleIn}s</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-white/8 rounded-full overflow-hidden">
            <div
              className={`timer-fill h-full rounded-full transition-all ${
                timerPct > 50 ? 'bg-indigo-500' : timerPct > 25 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Progress</span>
            <span className="font-mono font-bold text-emerald-400">{matchedCount}/5 pairs</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500"
              style={{ width: `${(matchedCount / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-6">
          {/* Row 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Row 1</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/8" />
              <span className="text-xs text-indigo-400 font-medium">Pick a card</span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {row1.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  isSelected={selected1?.id === card.id}
                  isWrong={wrongIds.includes(card.id)}
                  disabled={locked || !!selected1}
                  onClick={handleRow1Click}
                />
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Row 2</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/8" />
              <span className="text-xs text-violet-400 font-medium">Find the match</span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {row2.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  isSelected={selected2?.id === card.id}
                  isWrong={wrongIds.includes(card.id)}
                  disabled={locked || !selected1}
                  onClick={handleRow2Click}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tip */}
        <p className="text-center text-xs text-slate-600 mt-6">
          {selected1
            ? '👆 Now pick the matching card in Row 2'
            : '👆 Tap any card in Row 1 to begin'
          }
        </p>
      </div>
    </div>
  );
}
