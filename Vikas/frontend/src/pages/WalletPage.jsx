import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function WalletPage() {
  const { refreshUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const isPositiveTransaction = (type) =>
    ["deposit", "win", "adjustment"].includes(type);

  const fetchWallet = async () => {
    try {
      const res = await API.get("/wallet");
      setBalance(res.data.balance);
      setTransactions(res.data.transactions);
    } catch (err) {
      setError("Failed to load wallet");
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const deposit = async () => {
    try {
      setError("");
      await API.post("/wallet/deposit", {
        amount: Number(amount),
      });
      setAmount("");
      await fetchWallet();
      await refreshUser();
    } catch (err) {
      setError(err?.response?.data?.message || "Deposit failed");
    }
  };

  const withdraw = async () => {
    try {
      setError("");
      await API.post("/wallet/withdraw", {
        amount: Number(amount),
      });
      setAmount("");
      await fetchWallet();
      await refreshUser();
    } catch (err) {
      setError(err?.response?.data?.message || "Withdraw failed");
    }
  };

  return (
    <div className="page-wrap">
      <h2 className="page-title">Wallet</h2>

      <div className="balance-hero">
        <p className="balance-label">AVAILABLE BALANCE</p>
        <p className="balance-amount">Rs. {Number(balance || 0).toLocaleString("en-IN")}</p>
      </div>

      {error && <div className="toast err">{error}</div>}

      <div className="wallet-grid">
        <div className="wallet-box">
          <h3 className="box-title">MANAGE FUNDS</h3>
          <input
            className="inp"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="quick-bets">
            {[500, 1000, 2000, 5000].map((value) => (
              <button
                key={value}
                type="button"
                className="quick-btn"
                onClick={() => setAmount(String(value))}
              >
                Rs. {value}
              </button>
            ))}
          </div>

          <div className="wallet-actions">
            <button className="big-btn" onClick={deposit}>
              Deposit
            </button>
            <button className="big-btn outline" onClick={withdraw}>
              Withdraw
            </button>
          </div>
        </div>

        <div className="history-box">
          <h3 className="box-title">TRANSACTION HISTORY</h3>
          {transactions.length === 0 && <p className="empty-note">No transactions yet</p>}

          {transactions.map((tx) => (
            <div key={tx._id} className="tx-row">
              <div>
                <span className={isPositiveTransaction(tx.type) ? "tx-pos" : "tx-neg"}>
                  {isPositiveTransaction(tx.type) ? "+" : "-"}Rs. {Number(tx.amount || 0).toLocaleString("en-IN")}
                </span>
                <span className="tx-type"> . {tx.type}</span>
              </div>
              <span className="tx-date">{tx.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
