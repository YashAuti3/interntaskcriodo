import express from "express";
import {
  getUsers,
  updateUserBalance,
  getStats,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/users", protect, adminOnly, getUsers);
router.get("/stats", protect, adminOnly, getStats);
router.patch("/user/:id", protect, adminOnly, updateUserBalance);

export default router;