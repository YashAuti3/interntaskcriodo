import Game from "../models/Game.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import {
  createGameRows,
  MAX_ATTEMPTS,
  MAX_BET,
  WIN_MULT,
  shuffleRow,
  CARD_COUNT,
} from "../services/gameService.js";

const gameResponse = (game) => ({
  id: game._id,
  row1: game.row1,
  row2: game.row2,
  matchedCount: game.matchedCount,
  attempts: game.attempts,
  maxAttempts: game.maxAttempts,
  status: game.status,
  bet: game.bet,
  multiplier: game.multiplier,
  selectedRow1Index: game.selectedRow1Index,
});

export const startGame = async (req, res) => {
  const bet = Number(req.body.bet);

  if (!bet || bet < 1 || bet > MAX_BET) {
    return res.status(400).json({ message: "Invalid bet amount" });
  }

  const user = await User.findById(req.user._id);

  if (bet > user.balance) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  user.balance -= bet;
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "bet",
    amount: bet,
    status: "completed",
  });

  const { row1, row2 } = createGameRows();

  const game = await Game.create({
    user: user._id,
    bet,
    multiplier: WIN_MULT,
    row1,
    row2,
    matchedCount: 0,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    status: "playing",
    selectedRow1Index: -1,
  });

  res.status(201).json(gameResponse(game));
};

export const selectRow1 = async (req, res) => {
  const { gameId, row1Index } = req.body;

  const game = await Game.findOne({ _id: gameId, user: req.user._id });

  if (!game || game.status !== "playing") {
    return res.status(400).json({ message: "Invalid game" });
  }

  if (row1Index < 0 || row1Index >= CARD_COUNT) {
    return res.status(400).json({ message: "Invalid row1 index" });
  }

  if (game.row1[row1Index].matched) {
    return res.status(400).json({ message: "Card already matched" });
  }

  game.row1 = game.row1.map((card, i) => ({
    ...card.toObject(),
    revealed: i === row1Index,
  }));

  game.selectedRow1Index = row1Index;
  await game.save();

  res.json(gameResponse(game));
};

export const selectRow2 = async (req, res) => {
  const { gameId, row2Index } = req.body;

  const game = await Game.findOne({ _id: gameId, user: req.user._id });

  if (!game || game.status !== "playing") {
    return res.status(400).json({ message: "Invalid game" });
  }

  if (row2Index < 0 || row2Index >= CARD_COUNT) {
    return res.status(400).json({ message: "Invalid row2 index" });
  }

  if (game.selectedRow1Index < 0) {
    return res.status(400).json({ message: "Select a row1 card first" });
  }

  if (game.row2[row2Index].matched) {
    return res.status(400).json({ message: "Card already matched" });
  }

  const row1Index = game.selectedRow1Index;
  const row1Card = game.row1[row1Index];
  const row2Card = game.row2[row2Index];

  if (row1Card.num === row2Card.num) {
    game.row1[row1Index].matched = true;
    game.row1[row1Index].revealed = true;

    game.row2[row2Index].matched = true;
    game.row2[row2Index].revealed = true;

    game.matchedCount += 1;
    game.selectedRow1Index = -1;

    game.row1 = shuffleRow(game.row1.map((c) => c.toObject()));
    game.row2 = shuffleRow(game.row2.map((c) => c.toObject()));

    if (game.matchedCount >= CARD_COUNT) {
      game.status = "won";

      const user = await User.findById(req.user._id);
      const winAmount = game.bet * game.multiplier;
      user.balance += winAmount;
      await user.save();

      await Transaction.create({
        user: user._id,
        type: "win",
        amount: winAmount,
        status: "completed",
      });
    }

    await game.save();
    return res.json(gameResponse(game));
  }

  game.attempts += 1;

  game.row1[row1Index].revealed = false;
  game.row2[row2Index].revealed = false;

  game.row1 = shuffleRow(game.row1.map((c) => c.toObject()));
  game.row2 = shuffleRow(game.row2.map((c) => c.toObject()));
  game.selectedRow1Index = -1;

  if (game.attempts >= game.maxAttempts) {
    game.status = "lost";
  }

  await game.save();
  res.json(gameResponse(game));
};

export const getGame = async (req, res) => {
  const game = await Game.findOne({
    _id: req.params.gameId,
    user: req.user._id,
  });

  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  res.json(gameResponse(game));
};