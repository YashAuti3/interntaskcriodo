const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  placeBetAndStart,
  playMove
} = require("../controllers/gameController");

router.post("/start", authMiddleware, placeBetAndStart);
router.post("/play", authMiddleware, playMove);

module.exports = router;