# CardBlitz 🃏

A complete, modern, full-stack themed Web Application featuring an immersive memory-matching card game where users can bet virtual currency, manage their virtual wallet (with dummy QR-code integrations), view transaction history, and access an administrative dashboard.

## 🌟 Features

- **Modern UI/UX**: Built entirely on standard React with a high-end, bespoke **glassmorphic** theme using Tailwind CSS (v4).
- **Light/Dark Mode**: Completely custom-built fluid light & dark themes seamlessly integrated into every component.
- **Card Matching Action**: Users can bet on their memory! Match all pairs to multiply bets with dynamic card mechanics, timers, and reshuffling.
- **Virtual Economy**: Includes an integrated **Wallet** to observe balances, view histories, and theoretically "Top-up" with simulated QR code payments.
- **Authentication**: Fully functional client-side mock authentication utilizing local storage.
- **Admin Dashboard**: A secure portal available to designated administrators to manage and view site-wide user metrics and economies.

## 🚀 Running the Project

Ensure you have [Node.js](https://nodejs.org/) installed, then follow the setup below:

1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Start the Development Server**
   ```bash
   npm run dev
   ```
3. Open the port listed in your console (usually `http://localhost:5173/`) in the browser.

## 🔐 Accounts & Authentication

By default, everything runs locally simulated inside of standard Local Storage. You can register any arbitrary account on the "Sign Up" page to begin playing immediately.

### Administrator Access
For administration routes and privileges, a default admin account is pre-provisioned in local storage.

- **Admin Email**: `admin@cardblitz.com`
- **Admin Password**: `admin123`

*(Important: Only an account flagged as `isAdmin` can access the protected `/admin` route.)*

## 🛠 Tech Stack

- **React (`vite`)** for fast bundler tooling and seamless JSX.
- **Tailwind CSS (`@tailwindcss/vite`)** specifically using the newest V4 standard config.
- **React Router DOM** for standard client-side secure protected routing.
- **Phosphor Icons / Emojis** for performant minimal UI imagery.
