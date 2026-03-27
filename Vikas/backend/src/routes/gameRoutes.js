import express from "express";
import {
  startGame,
  selectRow1,
  selectRow2,
  getGame,
} from "../controllers/gameController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startGame);
router.post("/select-row1", protect, selectRow1);
router.post("/select-row2", protect, selectRow2);
router.get("/:gameId", protect, getGame);

export default router;