import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken, setTokenCookie } from "../utils/token.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    balance: 1200,
  });

  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.status(201).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      role: user.role,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      role: user.role,
    },
  });
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: "Logged out" });
};
