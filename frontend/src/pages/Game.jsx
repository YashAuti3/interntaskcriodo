import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/Axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, LogOut, Gamepad2, Trophy, 
  AlertCircle, History, Wallet as WalletIcon 
} from 'lucide-react';

// Sub-components (Modular)
import BetBox from '../components/BetBox';
import Card from '../components/Card';
import Wallet from '../components/Wallet';
import HistoryCard from '../components/HistoryCard';
import { ToastContainer, useToast } from '../components/Toast';

// Helpers
const generateRandomValues = () => {
  const nums = new Set();
  while(nums.size < 5) nums.add(Math.floor(Math.random() * 99) + 1);
  return Array.from(nums);
};
const createDeck = (prefix, values) => values.map((v, i) => ({ id: `${prefix}_${v}`, value: v, colorIndex: i + 1 }));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function Game() {
  const { user, refreshUser, setHideNav, gameStage: stage, setGameStage: setStage } = useAuth();
  const navigate = useNavigate();
  const { toasts, toast, dismiss } = useToast();

  // Playing State
  const [betAmount, setBetAmount] = useState('');
  const [betError, setBetError] = useState('');
  const [topCards, setTopCards] = useState([]);
  const [bottomCards, setBottomCards] = useState([]);
  const [matchedValues, setMatchedValues] = useState([]);
  const [activeTopId, setActiveTopId] = useState(null);
  const [activeBottomId, setActiveBottomId] = useState(null);
  const [shuffling, setShuffling] = useState(false);
  const [cardsHidden, setCardsHidden] = useState(false);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameResult, setGameResult] = useState(null);
  const [showQuit, setShowQuit] = useState(false);

  // Stats (Lobby)
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [walletMsgs, setWalletMsgs] = useState({ deposit: '', withdraw: '', isWithdrawError: false });

  // ── Sync ───────────────────────────────────────────────────────────────
  useEffect(() => { 
    setHideNav(stage === 'playing' || stage === 'gameover'); 
  }, [stage, setHideNav]);

  useEffect(() => {
    if (stage === 'lobby') loadHistory();
  }, [stage, user.email]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.game.getHistory(user.email);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Wallet Handlers ─────────────────────────────────────────────────────
  const handleDeposit = async (amount) => {
    try {
      await api.user.deposit(user.email, amount);
      await refreshUser();
      setWalletMsgs(prev => ({ ...prev, deposit: `₹${amount.toLocaleString()} Credited!` }));
      setTimeout(() => setWalletMsgs(prev => ({ ...prev, deposit: '' })), 3000);
    } catch (err) {
      toast('Deposit record failed. Inform admin.', 'error');
    }
  };

  const handleWithdraw = async (amount) => {
    setWalletMsgs(prev => ({ ...prev, withdraw: '', isWithdrawError: false }));
    if (amount <= 0) return;
    if (amount > user.balance) {
      setWalletMsgs(prev => ({ ...prev, withdraw: 'Insufficient Credits.', isWithdrawError: true }));
      return;
    }
    try {
      await api.user.updateBalance(user.email, user.balance - amount);
      await refreshUser();
      setWalletMsgs(prev => ({ ...prev, withdraw: `Request for ₹${amount} extracted.` }));
      
      // Auto-clear notification after 5 seconds
      setTimeout(() => {
        setWalletMsgs(prev => ({ ...prev, withdraw: '' }));
      }, 5000);
    } catch (err) {
      setWalletMsgs(prev => ({ ...prev, withdraw: 'System error during extraction.', isWithdrawError: true }));
    }
  };

  // ── Game Logic: Shuffle ──────────────────────────────────────────────────
  const doShuffle = useCallback((currentMatched) => {
    if (stage !== 'playing') return;
    setShuffling(true);
    setCardsHidden(true);
    setTimeout(() => {
      const shuffleInPlace = (prevCards) => {
        const unmatchedCards = [];
        const unmatchedIndices = [];
        prevCards.forEach((c, idx) => {
          if (!currentMatched.includes(c.value)) {
            unmatchedCards.push(c);
            unmatchedIndices.push(idx);
          }
        });
        const shufCards = shuffle(unmatchedCards);
        const res = [...prevCards];
        unmatchedIndices.forEach((idx, i) => { res[idx] = shufCards[i]; });
        return res;
      };

      setTopCards(prev => shuffleInPlace(prev));
      setBottomCards(prev => shuffleInPlace(prev));
      setActiveTopId(null);
      setActiveBottomId(null);

      setTimeout(() => {
        setCardsHidden(false);
        setShuffling(false);
      }, 200);
    }, 350);
  }, [stage]);

  // 30s Inactive Shuffle
  useEffect(() => {
    if (stage !== 'playing' || activeTopId || activeBottomId) return;
    const itv = setInterval(() => {
      doShuffle(matchedValues);
      toast('Inactivity sync — Refreshing unmatched cards.', 'info', 2000);
    }, 30000);
    return () => clearInterval(itv);
  }, [stage, matchedValues, activeTopId, activeBottomId, doShuffle, toast]);

  // ── Match Evaluation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeTopId || !activeBottomId) return;
    const top = topCards.find(c => c.id === activeTopId);
    const bot = bottomCards.find(c => c.id === activeBottomId);
    if (!top || !bot) return;

    if (top.value === bot.value) {
      const nextMatched = [...matchedValues, top.value];
      setMatchedValues(nextMatched);
      setActiveTopId(null);
      setActiveBottomId(null);

      if (nextMatched.length === 5) {
        finishGame(true);
      } else {
        toast(`Sequence Secure. ${nextMatched.length}/5 found.`, 'success', 2000);
        setTimeout(() => doShuffle(nextMatched), 600);
      }
    } else {
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);
      if (nextWrong >= 3) {
        finishGame(false);
      } else {
        toast(`Conflict Detected. ${nextWrong}/3 errors.`, 'warning', 2500);
        setTimeout(() => doShuffle(matchedValues), 900);
      }
    }
  }, [activeTopId, activeBottomId]);

  const finishGame = async (won) => {
    const bet = Number(betAmount);
    const payout = won ? bet * 3 : 0;
    await api.game.saveResult(user.email, { won, bet, payout });
    if (won) {
      await api.user.updateBalance(user.email, user.balance + payout);
      await refreshUser();
    }
    setGameResult({ won, payout });
    setStage('gameover');
  };

  const initiateGame = async (e) => {
    e.preventDefault();
    const amount = Number(betAmount);
    if (isNaN(amount) || amount < 10 || amount > 5000) {
      setBetError('Bet range: ₹10 - ₹5,000.');
      return;
    }
    if (amount > user.balance) {
      setBetError('Insufficient credits.');
      return;
    }
    try {
      await api.user.updateBalance(user.email, user.balance - amount);
      await refreshUser();
      setBetError('');
      setMatchedValues([]);
      setActiveTopId(null);
      setActiveBottomId(null);
      setWrongGuesses(0);
      setCardsHidden(false);
      setGameResult(null);
      const randomVals = generateRandomValues();
      setTopCards(shuffle(createDeck('t', randomVals)));
      setBottomCards(shuffle(createDeck('b', randomVals)));
      setStage('playing');
    } catch (err) {
      setBetError('Protocol failure during injection.');
    }
  };

  const handleCardClick = (card, row) => {
    if (shuffling || stage !== 'playing' || (activeTopId && activeBottomId)) return;
    if (row === 'top') {
      if (activeTopId === card.id) return;
      setActiveTopId(card.id);
    } else {
      if (activeBottomId === card.id) return;
      setActiveBottomId(card.id);
    }
  };

  const handleQuitConfirm = async () => {
    const bet = Number(betAmount);
    await api.game.saveResult(user.email, { won: false, bet, payout: 0, forfeited: true });
    setShowQuit(false);
    setStage('lobby');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-2 lg:px-0">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Main Content Area */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          
          {/* LOBBY STATE */}
          {stage === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 px-1 mb-2">
                <div className="p-2 bg-primary-600 rounded-xs shadow-lg shadow-primary-500/10">
                  <Gamepad2 className="text-white w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-main uppercase italic tracking-tighter">Mission Dashboard</h2>
                  <p className="text-[10px] text-dim font-black uppercase tracking-widest">Select Play in the menu above to start</p>
                </div>
              </div>

              {/* Wallet Section */}
              <Wallet 
                user={user} 
                onDeposit={handleDeposit} 
                onWithdraw={handleWithdraw}
                depositMsg={walletMsgs.deposit}
                withdrawMsg={walletMsgs.withdraw}
                isWithdrawError={walletMsgs.isWithdrawError}
              />

              {/* History Section */}
              <div className="space-y-3">
                <h3 className="text-[10px] text-muted font-black uppercase tracking-widest flex items-center gap-2 px-1">
                   <History size={12} /> Log History
                </h3>
                <HistoryCard history={history} />
              </div>
            </motion.div>
          )}

          {/* BETTING STATE */}
          {stage === 'betting' && (
            <motion.div
              key="betting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[80vh] flex flex-col items-center justify-center pt-10 sm:pt-20"
            >
              <div className="space-y-4 w-full">
                <BetBox 
                  betAmount={betAmount} 
                  setBetAmount={setBetAmount} 
                  error={betError} 
                  onSubmit={initiateGame} 
                />
                <button 
                  onClick={() => setStage('lobby')}
                  className="mx-auto block text-[10px] text-muted font-black uppercase tracking-widest hover:text-main transition-colors"
                >
                  Exit station and return to hub
                </button>
              </div>
            </motion.div>
          )}

          {/* PLAYING STATE */}
          {stage === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[85vh] flex flex-col items-center justify-center gap-6 pt-10 sm:pt-20"
            >
              <div className="w-full space-y-8">
              {/* HUD Bar */}
              <div className="grid grid-cols-3 gap-2 px-2">
                <div className="glass-panel py-2 px-3 text-center border-subtle">
                  <p className="text-[8px] text-dim font-black uppercase tracking-widest mb-0.5">Injection</p>
                  <p className="text-xs font-black text-main italic">₹{Number(betAmount).toLocaleString()}</p>
                </div>
                <div className="glass-panel py-2 px-3 text-center border-red-500/20 bg-red-500/5">
                  <p className="text-[8px] text-red-500/60 font-black uppercase tracking-widest mb-0.5">Alerts</p>
                  <p className={`text-xs font-black italic ${wrongGuesses > 0 ? 'text-red-500' : 'text-dim'}`}>
                    {wrongGuesses}/3
                  </p>
                </div>
                <div className="glass-panel py-2 px-3 text-center border-primary-500/20 bg-primary-500/5">
                  <p className="text-[8px] text-primary-500/60 font-black uppercase tracking-widest mb-0.5">Progress</p>
                  <p className="text-xs font-black text-primary-500 italic">{matchedValues.length}/5</p>
                </div>
              </div>

              {/* Grid Area */}
              <div className="flex-1 flex flex-col justify-center min-h-0 sm:pb-12">
                <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-2xl mx-auto w-full px-2">
                  {topCards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      isFlipped={activeTopId === card.id}
                      isMatched={matchedValues.includes(card.value)}
                      onClick={() => handleCardClick(card, 'top')}
                    />
                  ))}
                  {bottomCards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      isFlipped={activeBottomId === card.id}
                      isMatched={matchedValues.includes(card.value)}
                      onClick={() => handleCardClick(card, 'bottom')}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

          {/* GAME OVER STATE */}
          {stage === 'gameover' && gameResult && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[80vh] flex items-center justify-center p-4 pt-10 sm:pt-20"
            >
              <div className="glass-card max-w-sm w-full p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                <div className={`absolute top-0 inset-x-0 h-1 ${gameResult.won ? 'bg-green-500' : 'bg-red-500'}`} />
                
                <div className="space-y-2">
                  <div className={`w-20 h-20 mx-auto rounded-xs flex items-center justify-center border-2 mb-4 ${
                    gameResult.won ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
                  }`}>
                    {gameResult.won ? <Trophy size={40} /> : <AlertCircle size={40} />}
                  </div>
                  <h2 className="text-3xl font-black text-main italic tracking-tighter uppercase">
                    {gameResult.won ? 'Secure Success' : 'Session Terminated'}
                  </h2>
                </div>

                <div className="bg-field p-4 rounded-xs border border-field">
                   <p className="text-[9px] text-muted font-black uppercase tracking-widest mb-1">Total Yield</p>
                   <p className={`text-3xl font-black italic tracking-tighter ${gameResult.won ? 'text-green-500' : 'text-red-500'}`}>
                    {gameResult.won ? `+₹${gameResult.payout.toLocaleString()}` : `₹0`}
                   </p>
                </div>

                <div className="space-y-3 pt-4">
                  <button 
                    onClick={() => setStage('betting')}
                    className="btn-primary w-full py-4 text-xs tracking-widest uppercase"
                  >
                    Retry Sequence
                  </button>
                  <button 
                    onClick={() => setStage('lobby')}
                    className="btn-secondary w-full py-4 text-xs tracking-widest uppercase"
                  >
                    Hub Return
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ABORT MODAL */}
      <AnimatePresence>
        {showQuit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-xs w-full p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-xs flex items-center justify-center border border-red-500/30 text-red-500">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-main uppercase italic">Abort Signal?</h3>
                <p className="text-[10px] text-dim font-black uppercase tracking-widest mt-2 leading-relaxed">
                  Forfeiting will result in <span className="text-red-500">Total Loss</span> of injection.
                </p>
              </div>
              <div className="space-y-3">
                <button onClick={handleQuitConfirm} className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20">
                  Confirm Forfeit
                </button>
                <button onClick={() => setShowQuit(false)} className="btn-secondary w-full py-4 text-[10px] tracking-widest uppercase bg-transparent">
                  Stay in Matrix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
