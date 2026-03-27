# BetCard 

This `vikas` folder contains a full-stack betting game project with:

- a `frontend` built with React and Vite
- a `backend` built with Express and MongoDB
- cookie-based authentication
- wallet and transaction management
- an admin panel for user and balance management

The main user flow is:

1. Sign up or log in
2. Add wallet balance
3. Start a game by placing a bet
4. Match cards across two rows within the allowed attempts
5. Win payout on success or lose the bet on failure

## Project Structure

```text
vikas/
  backend/
    src/
      config/        # Environment and MongoDB connection
      controllers/   # Request handlers
      middleware/    # Auth, admin, and error middleware
      models/        # Mongoose schemas
      routes/        # API route definitions
      services/      # Game logic helpers
      utils/         # JWT cookie helpers
      app.js         # Express app setup
      server.js      # Server bootstrap
  frontend/
    public/          # Static assets
    src/
      api/           # Axios instance
      components/    # Reusable UI parts
      context/       # Auth state management
      pages/         # Auth, game, wallet, admin pages
      routes/        # Top-level app flow
      styles/        # Global styling
```

## Tech Stack

### Frontend

- React
- Vite
- Axios
- Plain CSS

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Cookie-based sessions
- bcryptjs for password hashing

## Features

### User Features

- Register and log in
- Persistent session with HTTP-only cookie
- Starting balance of `1000`
- Deposit funds
- Withdraw funds
- View recent transactions
- Play the card matching game

### Admin Features

- View all users
- View total user count
- View total balance in the system
- View total deposited amount
- Edit any user's balance

## Game Rules

The game logic is implemented in `backend/src/services/gameService.js`.

- Each game uses `5` hidden numbers in two rows
- Row 2 is shuffled so the order is different from Row 1
- The player places a bet before starting
- The player selects one card from Row 1 and then one card from Row 2
- If the numbers match:
  matched cards stay revealed
- If they do not match:
  the attempt count increases and unmatched cards are reshuffled
- Maximum attempts: `15`
- Maximum bet: `5000`
- Win multiplier: `3x`
- Matching all pairs wins the game and credits the payout to the wallet

## Authentication

Authentication is handled by the backend using JWT stored in a cookie named `token`.

- Login and registration both issue a token
- Protected routes read the token from cookies
- Admin routes require `role === "admin"`
- Session duration is `7 days`

## Wallet and Transactions

Wallet behavior:

- Deposits immediately increase user balance
- Withdrawals reduce balance and create a transaction with `pending` status
- Bets create a `bet` transaction
- Wins create a `win` transaction
- Admin balance edits create an `adjustment` transaction

Supported transaction types:

- `deposit`
- `withdraw`
- `bet`
- `win`
- `adjustment`

## API Overview

Base backend route prefix: `/api`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Wallet

- `GET /api/wallet`
- `POST /api/wallet/deposit`
- `POST /api/wallet/withdraw`

### Game

- `POST /api/game/start`
- `POST /api/game/select-row1`
- `POST /api/game/select-row2`
- `GET /api/game/:gameId`

### Admin

- `GET /api/admin/users`
- `GET /api/admin/stats`
- `PATCH /api/admin/user/:id`

## Environment Variables

### Backend

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend

Create a frontend environment file such as `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

## Getting Started

### 1. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 2. Start the backend

```bash
cd backend
npm run dev
```

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

Backend default URL:

```text
http://localhost:5000
```

## Data Models

### User

- `name`
- `email`
- `password`
- `balance`
- `role`
- `totalDeposited`
- `totalWithdrawn`

### Game

- `user`
- `bet`
- `multiplier`
- `row1`
- `row2`
- `matchedCount`
- `attempts`
- `maxAttempts`
- `status`
- `selectedRow1Index`

### Transaction

- `user`
- `type`
- `amount`
- `status`
- `note`

## Frontend Flow

The React app uses a small app-shell pattern instead of URL-based page routing.

- `AuthContext` loads the current user from `/auth/me`
- unauthenticated users see the auth page
- normal users can switch between `Game` and `Wallet`
- admin users are taken directly to the admin page

## Notes

- The backend enables CORS for the configured frontend URL and allows credentials
- Authentication depends on cookies, so frontend requests use `withCredentials: true`
- The UI is styled with a custom casino-like dark theme in `frontend/src/styles/global.css`

## Scripts

### Backend

- `npm run dev` - start backend with nodemon
- `npm start` - start backend with Node.js

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
