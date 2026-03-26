const express = require('express');
// const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');

dotenv.config();

// creating express instance
const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// mount auth routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});