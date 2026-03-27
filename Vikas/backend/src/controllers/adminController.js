import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const updateUserBalance = async (req, res) => {
  const { balance } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const nextBalance = Number(balance);

  if (Number.isNaN(nextBalance) || nextBalance < 0) {
    return res.status(400).json({ message: "Invalid balance" });
  }

  const delta = nextBalance - user.balance;
  user.balance = nextBalance;
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "adjustment",
    amount: Math.abs(delta),
    status: "completed",
    note: "Admin balance adjustment",
  });

  res.json({
    message: "Balance updated",
    user,
  });
};

export const getStats = async (req, res) => {
  const users = await User.find();
  const totalUsers = users.length;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const totalDeposited = users.reduce((sum, u) => sum + u.totalDeposited, 0);

  res.json({
    totalUsers,
    totalBalance,
    totalDeposited,
  });
};
