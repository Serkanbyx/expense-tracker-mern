# Expense Tracker (MERN Stack)

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge&logo=recharts&logoColor=white)

A full-stack personal finance tracker with interactive charts, JWT authentication, and comprehensive transaction management. Track income and expenses, visualize spending patterns with bar and pie charts, and filter transactions by month, category, or type.

## Features

- **JWT Authentication** — Secure register, login, and session management with token-based auth
- **Transaction CRUD** — Create, read, update, and delete income/expense transactions
- **Interactive Dashboard** — Summary cards, monthly bar chart, category pie chart, and recent transactions
- **Advanced Filtering** — Filter transactions by month, category, and type with instant updates
- **Data Visualization** — Monthly income vs. expense bar charts and category breakdown pie charts via Recharts
- **Responsive Design** — Mobile-first UI with collapsible sidebar, adaptive layouts, and touch-friendly targets
- **Security Hardened** — Helmet, rate limiting, NoSQL injection prevention, HPP protection, input sanitization
- **Form Validation** — Client-side and server-side validation with user-friendly error messages

## Screenshots

| Dashboard | Transactions |
|:---------:|:------------:|
| ![Dashboard](screenshots/dashboard.png) | ![Transactions](screenshots/transactions.png) |

> Add your screenshots to a `screenshots/` folder at the project root.

## Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd s4.6_Expense-Tracker-Mern
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your credentials:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=replace_with_a_strong_random_string_min_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> Generate a strong JWT secret:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

Start the server:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the client:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint                       | Description                      | Auth |
|--------|--------------------------------|----------------------------------|------|
| GET    | `/api/health`                  | Health check                     | No   |
| POST   | `/api/auth/register`           | Register a new user              | No   |
| POST   | `/api/auth/login`              | Login and receive JWT            | No   |
| GET    | `/api/auth/me`                 | Get current user profile         | Yes  |
| GET    | `/api/transactions`            | List transactions (with filters) | Yes  |
| GET    | `/api/transactions/summary`    | Get income/expense/net totals    | Yes  |
| GET    | `/api/transactions/monthly`    | Get monthly breakdown for charts | Yes  |
| GET    | `/api/transactions/categories` | Get category breakdown for charts| Yes  |
| POST   | `/api/transactions`            | Create a new transaction         | Yes  |
| PUT    | `/api/transactions/:id`        | Update a transaction             | Yes  |
| DELETE | `/api/transactions/:id`        | Delete a transaction             | Yes  |

## Folder Structure

```
expense-tracker-mern/
├── server/
│   ├── src/
│   │   ├── index.js                  # Express app entry point
│   │   ├── models/
│   │   │   ├── User.js               # User schema with bcrypt hashing
│   │   │   └── Transaction.js        # Transaction schema with indexes
│   │   ├── controllers/
│   │   │   ├── authController.js      # Register, login, getMe
│   │   │   └── transactionController.js # CRUD + aggregation pipelines
│   │   ├── routes/
│   │   │   ├── index.js              # Central router
│   │   │   ├── authRoutes.js         # Auth endpoints
│   │   │   └── transactionRoutes.js  # Transaction endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification middleware
│   │   │   ├── validate.js           # Express-validator result handler
│   │   │   ├── errorHandler.js       # Global error handler
│   │   │   └── validators/
│   │   │       ├── authValidator.js
│   │   │       └── transactionValidator.js
│   │   └── utils/
│   │       ├── generateToken.js      # JWT signing utility
│   │       └── verifyToken.js        # JWT verification utility
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.tsx                   # Router configuration
│   │   ├── main.tsx                  # React entry point
│   │   ├── index.css                 # Tailwind CSS imports
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Transactions.jsx
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── layout/
│   │   │   │   └── AppLayout.jsx     # Sidebar + header shell
│   │   │   ├── ui/
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── ErrorMessage.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCards.jsx
│   │   │   │   ├── MonthlyChart.jsx
│   │   │   │   ├── CategoryChart.jsx
│   │   │   │   └── RecentTransactions.jsx
│   │   │   └── transactions/
│   │   │       ├── FilterBar.jsx
│   │   │       ├── TransactionList.jsx
│   │   │       └── TransactionForm.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state + login/register/logout
│   │   │   └── TransactionContext.jsx # Transaction state + CRUD + filters
│   │   ├── services/
│   │   │   ├── api.ts                # Axios instance with interceptors
│   │   │   └── transactionService.js # Transaction API calls
│   │   └── utils/
│   │       ├── formatCurrency.js
│   │       └── validation.js
│   ├── public/
│   │   └── _redirects                # Netlify SPA routing
│   ├── .env.example
│   └── package.json
├── .gitignore
├── STEPS.md
└── README.md
```

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure the service:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Set environment variables in the Render dashboard:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render default)
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a cryptographically strong random string (min 32 chars)
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = your Netlify frontend URL (e.g., `https://your-app.netlify.app`)
5. Set **Health Check Path** to `/api/health` for automatic monitoring
6. Deploy — Render will automatically build and start the server

### Frontend — Netlify

1. Create a new site on [Netlify](https://netlify.com) and connect your GitHub repository
2. Configure the build settings:
   - **Base Directory:** `client`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `client/dist`
3. Set environment variables (Site settings → Environment variables):
   - `VITE_API_URL` = your Render backend URL (e.g., `https://your-api.onrender.com/api`)
4. SPA routing is handled automatically via `client/public/_redirects`
5. Deploy — Netlify will automatically build and deploy on every push

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
