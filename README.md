# 🃏 Betting Card Match Game

A premium, UNO-inspired card matching game built with React and Vite. Experience dynamic betting mechanics, a beautifully unified light/dark mode, and comprehensive game history tracking.

## ✨ Features

- **Authentication System:** Secure login and signup for both standard users and administrative accounts.
- **Betting Mechanics:** Place your bets (minimum ₹10) before starting a match. Win rewards or lose your bet based on your performance!
- **Dynamic Gameplay:** Interactive logic featuring strict time limits, a strike system for wrong moves, and instant feedback.
- **Unified Theming:** A polished, consistent Light and Dark mode utilizing curated design tokens and an elegant glassmorphism UI.
- **Game History:** Players can track their recent wins, losses, bets, and total earnings inside their personalized user dashboard.
- **Admin Dashboard:** A dedicated administrative view for managing registered users and reviewing platform statistics.
- **Responsive Design:** A smooth and interactive layout, designed to run flawlessly across different screen sizes.

## 🚀 Setup Instructions

Follow these steps to run the game locally on your machine:

1. **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) installed (v16 or higher is recommended).
2. **Open the Terminal:** Navigate your terminal to the project root directory.
3. **Install Dependencies:**
   Run the following command to install all required packages:
   ```bash
   npm install
   ```
4. **Run the Development Server:**
   Start the application by running:
   ```bash
   npm run dev
   ```
5. **Play the Game:**
   Open your browser and visit `http://localhost:5173/` to see the application running.

## 🛡️ Admin Credentials

To access the Admin Dashboard and oversee players, you can log in using the pre-configured default admin credentials:

- **Email:** `admin@test.com`
- **Password:** `password`

> **Note:** The current version uses local browser storage. Clearing your browser data will result in a reset of user accounts and game history back to the initial seeded state.

## 🛠️ Technology Stack

- **Framework:** React 19, Vite
- **Routing:** React Router v7
- **Styling & UI:** Tailwind CSS v4, `clsx`, `tailwind-merge`
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Database & State:** Custom database wrapper utilizing `localStorage`
