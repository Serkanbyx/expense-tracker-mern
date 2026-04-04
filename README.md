# Expense Tracker (MERN Stack)

A full-stack expense tracker application with interactive charts, authentication, and transaction management. Built with MongoDB, Express, React, and Node.js.

## Tech Stack

**Frontend:** React 19, TypeScript, Tailwind CSS 4, Recharts, React Router 7, Axios, React Hot Toast

**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT Authentication, Helmet, Rate Limiting

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)

## Local Development

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
# Edit .env with your MongoDB URI, JWT secret, and client URL
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your API URL (default: http://localhost:5000/api)
npm run dev
```

## Environment Variables

### Server (`server/.env`)

| Variable       | Description                          | Example                                      |
| -------------- | ------------------------------------ | -------------------------------------------- |
| `PORT`         | Server port                          | `5000`                                       |
| `MONGO_URI`    | MongoDB connection string            | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `JWT_SECRET`   | Secret key for JWT signing (min 32c) | Use `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | JWT token expiration              | `7d`                                         |
| `CLIENT_URL`   | Exact frontend origin (CORS)        | `https://your-app.netlify.app`               |

### Client (`client/.env`)

| Variable       | Description              | Example                              |
| -------------- | ------------------------ | ------------------------------------ |
| `VITE_API_URL` | Backend API base URL     | `https://your-api.onrender.com/api`  |

## Deployment

### Backend — Render

1. **Create a new Web Service** on [Render](https://render.com)
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Set environment variables** in the Render dashboard:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render default)
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a cryptographically strong random string
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = your Netlify frontend URL (e.g., `https://your-app.netlify.app`)
5. **Health check path:** Set to `/api/health` in the Render dashboard for automatic monitoring
6. **Deploy** — Render will automatically build and start the server

### Frontend — Netlify

> Deployment steps will be documented in Step 38.

## API Endpoints

| Method | Endpoint              | Description           | Auth |
| ------ | --------------------- | --------------------- | ---- |
| GET    | `/api/health`         | Health check          | No   |
| POST   | `/api/auth/register`  | Register new user     | No   |
| POST   | `/api/auth/login`     | Login user            | No   |
| GET    | `/api/transactions`   | Get all transactions  | Yes  |
| POST   | `/api/transactions`   | Create transaction    | Yes  |
| PUT    | `/api/transactions/:id` | Update transaction  | Yes  |
| DELETE | `/api/transactions/:id` | Delete transaction  | Yes  |

## License

MIT
