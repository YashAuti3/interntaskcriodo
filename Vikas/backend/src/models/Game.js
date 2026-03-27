import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    id: Number,
    num: Number,
    revealed: { type: Boolean, default: false },
    matched: { type: Boolean, default: false },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bet: {
      type: Number,
      required: true,
      min: 1,
    },
    multiplier: {
      type: Number,
      default: 3,
    },
    row1: {
      type: [cardSchema],
      required: true,
    },
    row2: {
      type: [cardSchema],
      required: true,
    },
    matchedCount: {
      type: Number,
      default: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ["playing", "won", "lost"],
      default: "playing",
    },
    selectedRow1Index: {
      type: Number,
      default: -1,
    },
  },
  { timestamps: true }
);

const Game = mongoose.model("Game", gameSchema);

export default Game;