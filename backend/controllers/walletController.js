const User = require("../models/User");

// GET WALLET BALANCE
exports.getWallet = async (req, res) => {
  res.json({
    wallet: req.user.wallet
  });
};

// ADD MONEY
exports.addMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(req.user._id);

    user.wallet += amount;
    await user.save();

    res.json({
      message: "Money added",
      wallet: user.wallet
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DEDUCT MONEY (used for betting)
exports.deductMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.user._id);

    if (user.wallet < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.wallet -= amount;
    await user.save();

    res.json({
      message: "Money deducted",
      wallet: user.wallet
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};