import { useState } from "react";
import API from "../api/axios";
import GameCard from "../components/GameCard";
import { useAuth } from "../context/AuthContext";

export default function GamePage() {
  const { refreshUser } = useAuth();
  const [game, setGame] = useState(null);
  const [bet, setBet] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startGame = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.post("/game/start", { bet: Number(bet) });
      setGame(res.data);
      await refreshUser();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const selectRow1 = async (index) => {
    try {
      if (!game || game.status !== "playing") return;
      const res = await API.post("/game/select-row1", {
        gameId: game.id,
        row1Index: index,
      });
      setGame(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid move");
    }
  };

  const selectRow2 = async (index) => {
    try {
      if (!game || game.status !== "playing") return;
      const res = await API.post("/game/select-row2", {
        gameId: game.id,
        row2Index: index,
      });
      setGame(res.data);
      if (res.data.status === "won" || res.data.status === "lost") {
        await refreshUser();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid move");
    }
  };

  if (!game) {
    return (
      <div className="page-center">
        <div className="bet-card">
          <div className="bet-suit">B</div>
          <h2 className="game-title">Place Your Bet</h2>
          <p className="game-sub">Match all 5 pairs to multiply your winnings.</p>

          <div className="bet-input-wrap">
            <span className="rupee-sym">Rs.</span>
            <input
              className="bet-num-input"
              type="number"
              value={bet}
              min={1}
              max={5000}
              onChange={(e) => setBet(e.target.value)}
            />
          </div>

          <div className="quick-bets">
            {[100, 250, 500, 1000, 2500].map((value) => (
              <button
                key={value}
                type="button"
                className={`quick-btn ${Number(bet) === value ? "active" : ""}`}
                onClick={() => setBet(value)}
              >
                Rs. {value}
              </button>
            ))}
          </div>

          {error && <p className="flash err">{error}</p>}

          <button className="big-btn" onClick={startGame} disabled={loading}>
            {loading ? "Starting..." : "Start Game"}
          </button>
        </div>
      </div>
    );
  }

  if (game.status === "won" || game.status === "lost") {
    return (
      <div className="page-center">
        <div className="result-card">
          <div className="result-confetti">{game.status === "won" ? "WIN" : "TRY"}</div>
          <h2
            className={`result-title ${
              game.status === "won" ? "won-color" : "lost-color"
            }`}
          >
            {game.status === "won" ? "You Won!" : "Game Over"}
          </h2>
          <p className="result-sub">
            {game.status === "won"
              ? "All pairs matched successfully."
              : "You used all attempts for this round."}
          </p>
          <p
            className={`result-amount ${
              game.status === "won" ? "won-color" : "lost-color"
            }`}
          >
            {game.status === "won"
              ? `Rs. ${Number((game.bet || 0) * (game.multiplier || 1)).toLocaleString("en-IN")}`
              : `Rs. ${Number(game.bet || 0).toLocaleString("en-IN")}`}
          </p>
          <button className="big-btn" onClick={() => setGame(null)}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-play-wrap">
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">BET</span>
          <span className="stat-val gold">Rs. {Number(game.bet || 0).toLocaleString("en-IN")}</span>
        </div>
        <div className="stat">
          <span className="stat-label">MATCHED</span>
          <span className="stat-val green">{game.matchedCount} / 5</span>
        </div>
        <div className="stat">
          <span className="stat-label">ATTEMPTS</span>
          <span className="stat-val">
            {game.attempts} / {game.maxAttempts}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">POTENTIAL WIN</span>
          <span className="stat-val gold">
            Rs. {Number((game.bet || 0) * (game.multiplier || 1)).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="flash-zone">
        {error ? (
          <span className="flash err">{error}</span>
        ) : (
          <span className="instruction">
            {game.selectedRow1Index < 0
              ? "Select a card from Row 1"
              : "Now select its match from Row 2"}
          </span>
        )}
      </div>

      <p className="row-label">ROW 1</p>
      <div className="card-row">
        {game.row1.map((card, i) => (
          <GameCard
            key={i}
            card={card}
            selected={game.selectedRow1Index === i}
            onClick={() => selectRow1(i)}
            disabled={card.matched || game.status !== "playing"}
          />
        ))}
      </div>

      <div className="vs-divider">
        <span className="vs-text">VS</span>
      </div>

      <p className="row-label">ROW 2</p>
      <div className="card-row">
        {game.row2.map((card, i) => (
          <GameCard
            key={i}
            card={card}
            onClick={() => selectRow2(i)}
            disabled={
              card.matched ||
              game.status !== "playing" ||
              game.selectedRow1Index < 0
            }
          />
        ))}
      </div>
    </div>
  );
}
