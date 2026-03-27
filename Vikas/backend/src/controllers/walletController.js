import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const getWallet = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({
    balance: user.balance,
    transactions,
  });
};

export const deposit = async (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount < 1) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const user = await User.findById(req.user._id);
  user.balance += amount;
  user.totalDeposited += amount;
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "deposit",
    amount,
    status: "completed",
  });

  res.json({ balance: user.balance, message: "Deposit successful" });
};

export const withdraw = async (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount < 1) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const user = await User.findById(req.user._id);

  if (amount > user.balance) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  user.balance -= amount;
  user.totalWithdrawn += amount;
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "withdraw",
    amount,
    status: "pending",
  });

  res.json({ balance: user.balance, message: "Withdrawal requested" });
};