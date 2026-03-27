# Flip&Win 🎰

A full-stack betting-based card matching game with real wallet management, JWT authentication, and admin controls. Users can place bets, play strategic card games, and win rewards in a secure environment.

---

## 🚀 Live Demo

**Frontend:** [https://interntaskcriodo.vercel.app/]
**Backend API:** [https://interntaskcriodo.onrender.com]

---

## 📌 Features

### User Authentication
- JWT-based login and registration
- Secure password hashing
- Session management

### Wallet System
- Add money to wallet
- Withdraw money from wallet
- Real-time balance tracking
- Transaction history

### Betting System
- Place bets before game starts
- Automatic wallet deduction on bet placement
- Wallet credit on game win

### Card Matching Game
- **Board Layout:** 2 rows of 5 cards (10 cards total)
- **Card Set:** Same numbers in both rows but randomly shuffled
- **Game Mechanics:**
  - Cards flip on selection with smooth animations
  - Matched pairs remain open
  - Non-matched pairs flip back automatically
  - Limited attempts per game (default: 10 attempts)
  - Win condition: Successfully match 3 pairs
  - Lose condition: Exceed maximum attempts

### Anti-Cheat Logic
- **Dynamic Shuffling:** Cards reshuffle periodically during the game
- **Interaction-Based:** Shuffle stops immediately when user interacts with cards
- **Security:** Prevents memorization exploits and ensures fair gameplay

### Admin Panel
- View all registered users with detailed statistics
- Adjust user wallet balances manually
- Monitor total users count
- Track total wallet value across system

---

## 🧠 Game Logic Explanation

### Card Generation
1. Two identical arrays of numbers (1-5, each repeated twice for matching potential) are created
2. Both arrays are randomly shuffled independently
3. Cards are arranged in a 2×5 grid with the shuffled values

### Matching System
- User selects two cards from the board
- If card values match: Cards remain open, pair is marked as won
- If card values don't match: Both cards flip back, attempt count increases

### Attempt System
- Players start with a limited number of attempts (typically 10)
- Each failed match consumes one attempt
- Game ends in loss when attempts reach zero
- Successful matches don't consume attempts

### Shuffle Logic
- **Timer-Based:** Cards reshuffle every 8-10 seconds during gameplay (configurable)
- **Interaction Triggered:** On failed match, cards automatically reshuffle
- **Strategic Depth:** Forces players to adapt rather than memorize positions

### Win/Loss Conditions
- **Win:** Match 3 or more pairs before attempts run out
- **Loss:** Fail to match 3 pairs within the attempt limit
- **Result:** Wallet automatically updated based on bet multiplier and game outcome

### Wallet Update
- Bet amount is deducted before game starts
- On win: Player receives bet amount × multiplier (e.g., 2× for 3 matched pairs)
- On loss: Bet amount is forfeited
- All transactions are logged and retrievable

---

## 🏗️ Tech Stack

### Frontend
- **React** (Vite) - Lightning-fast development and build
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing and navigation
- **CSS3** - Modern styling and animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Minimalist web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT (jsonwebtoken)** - Secure token-based authentication
- **bcryptjs** - Password hashing and security

### Deployment
- **Frontend:** Vercel - Optimized React hosting
- **Backend:** Render - Node.js application hosting

---

## 📁 Folder Structure

```
BettingApp/
├── frontend/                 # React Vite application
│   ├── src/
│   │   ├── components/       # Reusable UI components (BetBox, Card, Navbar, etc.)
│   │   ├── pages/            # Page components (Login, Register, Game, Admin)
│   │   ├── routes/           # Route configuration and protected routes
│   │   ├── context/          # React context for state management (AuthContext)
│   │   ├── api/              # Axios instance and API configuration
│   │   ├── assets/           # Images, icons, static files
│   │   └── main.jsx          # Application entry point
│   ├── .env                  # Frontend environment variables
│   └── package.json          # Dependencies and scripts
│
├── backend/                  # Node.js Express server
│   ├── controllers/          # Business logic (authController, gameController, etc.)
│   ├── models/               # Mongoose schemas (User, Game, Transaction)
│   ├── routes/               # API endpoints (authRoutes, gameRoutes, etc.)
│   ├── middlewares/          # Authentication and authorization middleware
│   ├── services/             # Utility services (password hashing, token generation)
│   ├── config/               # Configuration files (database connection)
│   ├── server.js             # Express server setup
│   ├── .env                  # Backend environment variables
│   └── package.json          # Dependencies and scripts
│
└── README.md                 # Project documentation
```

### Key Directories Explained
- **Components:** Reusable UI elements like card displays, bet boxes, and navigation bars
- **Pages:** Full-page views for login, game, admin panel, and registration
- **Routes:** Client-side routing configuration and protected route wrappers
- **Controllers:** Backend logic handling requests (authentication, game flow, wallet operations)
- **Models:** Database schemas defining User, Game, and Transaction structures

---

## ⚙️ Setup Instructions (Local Development)

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/betting_app
   JWT_SECRET=your_secure_random_secret_key_here
   NODE_ENV=development
   PORT=5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Frontend will typically run on `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db_name` |
| `JWT_SECRET` | Secret key for token signing | `your_random_secure_key` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` or production URL |

---

## 👨‍💼 Admin Access

Test the admin panel with these demo credentials:

**Email:** `admin@test.com`  
**Password:** `admin123`

Admin features:
- View all users and their wallet balances
- Manually adjust user walances for testing
- View system statistics (total users, total wallet value)
- Monitor active games and transactions

---

## 📌 Important Notes

⚠️ **Security & Setup:**
- **Never commit `.env` files** to version control. Add `.env` to `.gitignore`
- **Backend must be running first** before starting the frontend
- **Verify API URLs** to match your deployment environment
- Update `VITE_API_URL` with the production backend URL when deploying to production
- **JWT Secret** should be a strong, random string in production
- Use HTTPS in production to secure authentication tokens

✅ **Best Practices:**
- Test thoroughly in development before deploying
- Monitor backend logs for errors and suspicious activity
- Regularly back up MongoDB data
- Use environment-specific configurations for staging and production

---

## 📈 Future Improvements

- **Transaction History:** Detailed logs of all wallet transactions and game results
- **Enhanced Animations:** Smooth card flip effects, win/loss celebrations, and transitions
- **Real Payment Integration:** Stripe or similar for actual money deposits and withdrawals
- **Game Analytics:** Player statistics, win rates, popular bet amounts, and game metrics
- **Leaderboards:** Global rankings based on total winnings or win streak
- **Multiplayer Mode:** Real-time competitive games between players
- **Mobile Optimization:** Fully responsive design for mobile devices
- **Email Notifications:** Transaction alerts and game result notifications
- **Two-Factor Authentication:** Enhanced security for user accounts
- **Custom Themes:** Dark mode and customizable UI themes

---

## 📄 License

This project is provided for educational and demonstration purposes.

## 🤝 Support

For issues, questions, or feedback, please refer to the project repository or contact the development team.

---

**Last Updated:** March 2025  
**Version:** 1.0.0
