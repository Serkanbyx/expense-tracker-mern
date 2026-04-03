# Expense Tracker (Charts + Mongo) — Step-by-Step Build Guide

> Each step below is a self-contained prompt. Follow them in order.
> No step limit — every detail is covered.

---

## Phase 1 — Project Scaffolding & Configuration

### Step 1: Initialize the Monorepo Structure

Create the project folder structure with two workspaces: `server/` for the Express REST API and `client/` for the React SPA. Initialize a root `package.json` with project metadata. Inside `server/`, run `npm init -y`. Inside `client/`, scaffold a Vite + React project with the TypeScript template. Create a root `.gitignore` that covers `node_modules/`, `.env`, `.env.local`, `.env.production`, `dist/`, `build/`, `*.log` for both workspaces — this is critical since the repo will be public and secrets must never be committed.

### Step 2: Install Server Dependencies

Navigate to `server/`. Install production dependencies: `express`, `mongoose`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`, `express-validator`, `date-fns`, `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `hpp`. Install dev dependencies: `nodemon`. Create the npm scripts: `"dev": "nodemon src/index.js"` and `"start": "node src/index.js"`. Create a `.env.example` file listing required environment variables with placeholder values (never real credentials): `PORT=5000`, `MONGO_URI=mongodb://localhost:27017/expense-tracker`, `JWT_SECRET=replace_with_a_strong_random_string_min_32_chars`, `JWT_EXPIRES_IN=7d`, `CLIENT_URL=http://localhost:5173`. Add a comment in `.env.example` warning that `JWT_SECRET` must be a cryptographically strong random string (minimum 32 characters).

### Step 3: Install Client Dependencies

Navigate to `client/`. Install production dependencies: `axios`, `react-router-dom`, `recharts`, `date-fns`, `react-hot-toast`, `@heroicons/react`. Install and configure TailwindCSS v4 with its Vite plugin. Set up path aliases in `vite.config.ts` so `@/` maps to `src/`. Verify the dev server starts without errors.

### Step 4: Configure the Server Entry Point & Middleware Stack

Create `server/src/index.js`. Set up Express with the following security-hardened middleware stack in order:

1. `helmet()` — sets secure HTTP headers (X-Content-Type-Options, Strict-Transport-Security, X-Frame-Options, etc.)
2. `cors({ origin: CLIENT_URL, credentials: true })` — restrict to the exact frontend origin, never use `*` in production
3. `express.json({ limit: '10kb' })` — parse JSON body with a size limit to prevent large payload attacks
4. `express.urlencoded({ extended: false, limit: '10kb' })` — parse URL-encoded body with size limit
5. `mongoSanitize()` — strip MongoDB operators (`$gt`, `$ne`, etc.) from user input to prevent NoSQL injection
6. `hpp()` — protect against HTTP Parameter Pollution attacks

Apply a global rate limiter using `express-rate-limit`: max 100 requests per 15 minutes per IP, with a clear message `"Too many requests, please try again later"`. Apply a stricter rate limiter specifically to `/api/auth` routes: max 20 requests per 15 minutes per IP (brute-force protection).

Connect to MongoDB via Mongoose using `MONGO_URI` from `.env`. Disable Mongoose debug mode in production. Listen on `PORT`. Log a success message on both DB connection and server start (but never log sensitive env values). Export the app instance for potential testing.

---

## Phase 2 — Authentication (Backend)

### Step 5: Create the User Model

Create `server/src/models/User.js`. Define a Mongoose schema with fields: `name` (String, required, trimmed, maxlength 50), `email` (String, required, unique, lowercase, trimmed, maxlength 100), `password` (String, required, minlength 8, select: false). Setting `select: false` on password ensures it is never returned in queries by default — you must explicitly use `.select('+password')` when needed (e.g., during login). Add a pre-save hook that hashes the password with `bcryptjs` (salt rounds: 12) only when the password field is modified. Add an instance method `comparePassword(candidatePassword)` that returns `bcrypt.compare` result. Add `timestamps: true` to the schema options. Do NOT add a `toJSON` transform that exposes internal fields — only return `id`, `name`, `email` via controller logic.

### Step 6: Create JWT Utility Helpers

Create `server/src/utils/generateToken.js`. Export a function that takes a `userId`, signs a JWT with `JWT_SECRET`, sets expiration to `JWT_EXPIRES_IN` (default `"7d"`), and returns the token string. The payload should only contain `{ userId }` — never include sensitive data (email, role, password) in the JWT payload since it is base64-encoded and publicly readable. Create `server/src/utils/verifyToken.js`. Export a function that takes a token string, verifies it with `JWT_SECRET`, and returns the decoded payload. Wrap in try-catch and return `null` on any error (expired, malformed, invalid signature) — never expose the specific JWT error reason to the client.

### Step 7: Create the Auth Middleware

Create `server/src/middleware/auth.js`. Export an async middleware that: reads the `Authorization` header, extracts the Bearer token (return `401` immediately if header is missing or not in `Bearer <token>` format), verifies it using the `verifyToken` utility (return `401` if verification returns null), queries the User model by decoded `userId` (password is already excluded via `select: false`), checks the user still exists in DB (return `401` if deleted after token was issued), attaches the user document to `req.user`, and calls `next()`. Use a single generic error message for all failure cases: `401 { message: "Not authorized" }` — never reveal whether the token is expired, malformed, or the user was deleted.

### Step 8: Create Auth Validation Rules

Create `server/src/middleware/validators/authValidator.js`. Using `express-validator`, export two arrays of validation chains:

- `registerRules`: name required + `trim()` + `escape()` + maxlength 50, email is valid email + `normalizeEmail()`, password min 8 chars + max 128 chars (prevent bcrypt DoS with extremely long passwords).
- `loginRules`: email is valid email + `normalizeEmail()`, password not empty + max 128 chars.

Apply `trim()` and `escape()` on all string inputs to prevent XSS via stored payloads. Create a reusable `validate` middleware in `server/src/middleware/validate.js` that checks `validationResult(req)` and returns `400` with the errors array if validation fails, otherwise calls `next()`. The error response should only contain field names and generic validation messages — never echo back the raw user input in error responses.

### Step 9: Create the Auth Controller

Create `server/src/controllers/authController.js`. Implement three async functions:

- `register`: Check if email already exists → respond `409 { message: "Email already in use" }`. Create user. Generate token. Respond `201 { user: { id, name, email }, token }`. Never return the password hash or any internal fields.
- `login`: Find user by email using `.select('+password')` to include the password field. Use the **same generic error message** `401 { message: "Invalid credentials" }` for both "user not found" and "wrong password" cases — this prevents user enumeration attacks (attackers cannot determine which emails are registered).
- `getMe`: Return `200 { user: { id, name, email } }` — explicitly pick only safe fields from `req.user`, never spread the entire document.

Wrap each function with a try-catch. In the catch block, never send `error.message` directly to the client in production — respond with `500 { message: "Internal server error" }`. Log the actual error server-side only.

### Step 10: Create Auth Routes & Mount Them

Create `server/src/routes/authRoutes.js`. Define three routes:

- `POST /register` → registerRules + validate + register
- `POST /login` → loginRules + validate + login
- `GET /me` → auth middleware + getMe

Create `server/src/routes/index.js` as a central router. Mount auth routes at `/api/auth`. Import and use this central router in `index.js`.

---

## Phase 3 — Transaction Model & CRUD (Backend)

### Step 11: Create the Transaction Model

Create `server/src/models/Transaction.js`. Define a Mongoose schema with fields:

- `type`: String, required, enum `['income', 'expense']`
- `amount`: Number, required, min 0.01
- `category`: String, required, trimmed (e.g., "food", "salary", "transport", "entertainment", "health", "education", "shopping", "bills", "other")
- `description`: String, trimmed, maxlength 200
- `date`: Date, required, default `Date.now`
- `userId`: ObjectId, ref `'User'`, required

Add `timestamps: true`. Add an index on `{ userId: 1, date: -1 }` for query performance.

### Step 12: Create Transaction Validation Rules

Create `server/src/middleware/validators/transactionValidator.js`. Using `express-validator`, export validation chains for create and update:

- `createTransactionRules`: type is required and strictly in `['income', 'expense']` (use `.isIn()`), amount is required and is a positive float with max value `999999999.99` (prevent absurd values), category is required + `trim()` + `escape()` + must be one of the allowed category enum values (whitelist — never accept arbitrary strings), description is optional + `trim()` + `escape()` + max 200 chars, date is optional but must be a valid ISO 8601 date if provided and must not be in the future (prevent impossible dates).
- `updateTransactionRules`: same rules but all fields are optional (for partial updates).

Always whitelist allowed values with `.isIn()` rather than blacklisting. Apply `trim()` and `escape()` on every string field to prevent stored XSS.

### Step 13: Create the Transaction Controller — CRUD Operations

Create `server/src/controllers/transactionController.js`. Implement:

- `createTransaction`: Only pick whitelisted fields from `req.body` (`type`, `amount`, `category`, `description`, `date`) — never spread `req.body` directly into the model. Always set `userId: req.user._id` server-side (never trust client-sent userId). Respond `201` with the created document.
- `getTransactions`: Query transactions where `userId` matches `req.user._id` — this scoping is critical for data isolation between users. Parse query params `month` (format `"YYYY-MM"` — validate format with regex before using), `category` (validate against allowed enum), and `type` (validate against `['income', 'expense']`). Ignore any unrecognized query params. Build a `$match` filter object dynamically. If `month` is provided, calculate the start and end dates of that month using `date-fns` (`startOfMonth`, `endOfMonth`, `parse`). Sort by `date: -1`. Add pagination: accept `page` and `limit` query params (default `limit: 50`, max `limit: 100`) to prevent dumping entire collections. Respond `200` with the array and pagination metadata.
- `getTransactionById`: Validate that `:id` is a valid MongoDB ObjectId format (return `400` if not). Find by `_id` AND `userId` (both conditions). Return `404` if not found. Respond `200`.
- `updateTransaction`: Validate `:id` is a valid ObjectId. Only pick whitelisted update fields from `req.body` — never allow `userId` or `_id` to be overwritten. Find by `_id` AND `userId`, apply updates via `findOneAndUpdate` with `{ new: true, runValidators: true }`. Return `404` if not found. Respond `200`.
- `deleteTransaction`: Validate `:id` is a valid ObjectId. Find by `_id` AND `userId`, delete via `findOneAndDelete`. Return `404` if not found. Respond `200 { message: "Transaction deleted" }`.

### Step 14: Create the Summary Controller — Aggregation Pipelines

In the same `transactionController.js` file (or a separate `summaryController.js`), implement:

- `getSummary`: Use MongoDB aggregation on the Transaction collection.
  - Pipeline: always start with `$match` by `userId: new mongoose.Types.ObjectId(req.user._id)` — never skip the userId match in aggregation pipelines, as it would leak other users' data. Then `$group` by `type` with `$sum` of `amount`. Return an object `{ totalIncome, totalExpense, netBalance }`. Accept optional `month` query param (validate format) to scope the summary to a specific month.
- `getMonthlyBreakdown`: Aggregation pipeline:
  - `$match` by `userId` (always first stage — mandatory). Optionally filter by `type` and/or `year` (validate year is a reasonable number, e.g., 2000–2100).
  - `$group` by `{ month: { $month: "$date" }, year: { $year: "$date" }, type: "$type" }` with `total: { $sum: "$amount" }`.
  - `$sort` by `year` and `month` ascending.
  - Return the array so the frontend can build a BarChart.
- `getCategoryBreakdown`: Aggregation pipeline:
  - `$match` by `userId` (always first stage — mandatory). Optionally filter by `type` and `month`.
  - `$group` by `"$category"` with `total: { $sum: "$amount" }`.
  - `$sort` by `total: -1`.
  - Return the array so the frontend can build a PieChart.

**Security note**: Every aggregation pipeline MUST begin with a `$match` stage that filters by `userId`. Without this, a user could see another user's financial data. Treat this as the most critical security rule in the entire backend.

### Step 15: Create Transaction Routes & Mount Them

Create `server/src/routes/transactionRoutes.js`. All routes require auth middleware. Define:

- `GET /` → getTransactions (with query param filtering)
- `GET /summary` → getSummary
- `GET /monthly` → getMonthlyBreakdown
- `GET /categories` → getCategoryBreakdown
- `POST /` → createTransactionRules + validate + createTransaction
- `PUT /:id` → updateTransactionRules + validate + updateTransaction
- `DELETE /:id` → deleteTransaction

Mount at `/api/transactions` in the central router.

### Step 16: Add Global Error Handler & Not-Found Middleware

Create `server/src/middleware/errorHandler.js`. Export a `notFound` middleware that catches unmatched routes and returns `404 { message: "Route not found" }`. Export an `errorHandler` middleware (4-param signature) that:

- In **development**: log the full error stack to the console. Respond with `{ message: error.message, stack: error.stack }`.
- In **production**: log the error server-side only (never send to client). Respond with a generic `{ message: "Internal server error" }` for unexpected errors — never expose stack traces, file paths, or internal error details to the client. For known operational errors (validation, not found, etc.), send only the safe error message with the correct status code.

Handle specific Mongoose errors gracefully: `CastError` → `400 "Invalid ID format"`, `ValidationError` → `400` with field messages, duplicate key `11000` → `409 "Duplicate field value"`. Apply both middlewares in `index.js` after all route mounts.

---

## Phase 4 — Frontend Auth & Routing

### Step 17: Set Up Axios Instance & Auth Interceptors

Create `client/src/services/api.js`. Create an Axios instance with `baseURL` pointing to the backend (`import.meta.env.VITE_API_URL`). Set a default request timeout (e.g., `timeout: 10000` — 10 seconds) to prevent hanging requests. Add a request interceptor that reads the token from `localStorage` and attaches it as `Authorization: Bearer <token>`. Add a response interceptor that catches `401` errors, clears localStorage (remove only auth-related keys, not everything), and redirects to `/login`. Never log token values or sensitive data to the browser console. Export the instance.

### Step 18: Create the Auth Context & Provider

Create `client/src/context/AuthContext.jsx`. Using React Context + `useReducer`, manage state: `{ user, token, isAuthenticated, isLoading }`. Actions: `LOGIN_SUCCESS`, `LOGOUT`, `SET_LOADING`, `USER_LOADED`. On mount, if a token exists in localStorage, call `GET /api/auth/me` to validate the token is still valid and load the user — if the call fails (401), clear the token from localStorage immediately (handles expired/revoked tokens). In the `logout` function, remove the token from localStorage and reset all state. Never store the user's password or any sensitive data in context or localStorage. Provide `login`, `register`, `logout` functions. Export `AuthContext` and `AuthProvider`. Create a `useAuth` custom hook.

### Step 19: Create Auth Pages — Login & Register

Create `client/src/pages/Login.jsx` and `client/src/pages/Register.jsx`. Each page is a centered card with a clean, modern form. Fields: email + password (Login), name + email + password (Register). Use controlled inputs with local state. Add `autoComplete` attributes to inputs (`autoComplete="email"`, `autoComplete="current-password"`, `autoComplete="new-password"`) for proper browser password manager integration. Disable the submit button while a request is in flight to prevent double submissions. On submit, call the respective auth context function. Show loading spinner on the button during submission. Show error toast (`react-hot-toast`) on failure — display only the server's error message, never expose technical details. Redirect to `/dashboard` on success. Include a link to switch between Login/Register. If the user is already authenticated (token exists), redirect away from auth pages immediately.

### Step 20: Set Up React Router with Protected Routes

Create `client/src/components/ProtectedRoute.jsx` that checks `isAuthenticated` from auth context — if false, redirect to `/login`; if `isLoading`, show a full-page spinner. Create `client/src/App.jsx` with routes:

- `/login` → Login page
- `/register` → Register page
- `/dashboard` → ProtectedRoute → Dashboard page
- `/transactions` → ProtectedRoute → Transactions page
- `*` → Redirect to `/dashboard`

Wrap everything with `AuthProvider` and `BrowserRouter`. Add `<Toaster />` from react-hot-toast at the root.

---

## Phase 5 — Frontend Layout & Navigation

### Step 21: Create the App Layout with Sidebar & Header

Create `client/src/components/layout/AppLayout.jsx`. This is the shell for authenticated pages. It contains:

- A responsive sidebar (collapsible on mobile) with navigation links: Dashboard, Transactions. Include user name/email at the bottom and a Logout button.
- A top header bar showing the current page title and a mobile menu toggle button.
- A main content area that renders the child route via `<Outlet />`.

Style with TailwindCSS. Use a clean, minimal design with a white/gray color scheme and accent color (e.g., indigo-600). Update the router to wrap protected routes inside `AppLayout`.

---

## Phase 6 — Transaction Service & State Management

### Step 22: Create the Transaction API Service

Create `client/src/services/transactionService.js`. Export functions that call the backend via the Axios instance:

- `getTransactions(filters)` — GET `/api/transactions` with query params
- `createTransaction(data)` — POST `/api/transactions`
- `updateTransaction(id, data)` — PUT `/api/transactions/:id`
- `deleteTransaction(id)` — DELETE `/api/transactions/:id`
- `getSummary(filters)` — GET `/api/transactions/summary`
- `getMonthlyBreakdown(filters)` — GET `/api/transactions/monthly`
- `getCategoryBreakdown(filters)` — GET `/api/transactions/categories`

### Step 23: Create the Transaction Context & Provider

Create `client/src/context/TransactionContext.jsx`. Manage state: `{ transactions, summary, monthlyData, categoryData, isLoading, filters }`. Filters state: `{ month, category, type }`. Provide functions: `fetchTransactions`, `fetchSummary`, `fetchMonthlyBreakdown`, `fetchCategoryBreakdown`, `addTransaction`, `editTransaction`, `removeTransaction`, `setFilters`. When filters change, automatically re-fetch transactions and summary data. Export `TransactionProvider` and `useTransactions` hook. Wrap the protected routes with this provider.

---

## Phase 7 — Dashboard Page

### Step 24: Build the Summary Cards Component

Create `client/src/components/dashboard/SummaryCards.jsx`. Display 3 cards in a responsive grid (1 col on mobile, 3 cols on desktop):

- **Total Income**: Green accent, up-arrow icon, formatted amount (e.g., `$12,500.00`)
- **Total Expense**: Red accent, down-arrow icon, formatted amount
- **Net Balance**: Blue/indigo accent, wallet icon, formatted amount (green if positive, red if negative)

Use data from `useTransactions().summary`. Show skeleton/placeholder while loading. Create a shared currency formatter utility `client/src/utils/formatCurrency.js`.

### Step 25: Build the Monthly Bar Chart Component

Create `client/src/components/dashboard/MonthlyChart.jsx`. Using Recharts `BarChart`:

- X-axis: month labels (formatted with `date-fns` → "Jan", "Feb", etc.)
- Two bars per month: Income (green) and Expense (red)
- Responsive container, tooltip showing exact amounts, legend
- Use data from `useTransactions().monthlyData`

Show a "No data available" message if the array is empty. Show a loading skeleton while fetching.

### Step 26: Build the Category Pie Chart Component

Create `client/src/components/dashboard/CategoryChart.jsx`. Using Recharts `PieChart`:

- Each slice = one category, sized by total amount
- Custom color palette for categories (assign consistent colors)
- Labels showing category name + percentage
- Responsive container, tooltip, legend
- Use data from `useTransactions().categoryData`

Add a toggle or tabs to switch between viewing Income categories and Expense categories.

### Step 27: Build the Recent Transactions Component

Create `client/src/components/dashboard/RecentTransactions.jsx`. Display the 5 most recent transactions in a clean list/table. Each row shows: date (formatted with `date-fns` → "dd MMM yyyy"), category badge, description, amount (green for income, red for expense with +/- prefix). Include a "View All" link that navigates to `/transactions`.

### Step 28: Assemble the Dashboard Page

Create `client/src/pages/Dashboard.jsx`. Compose the page:

1. Page title: "Dashboard"
2. `<SummaryCards />`
3. Two-column grid (stacked on mobile): `<MonthlyChart />` on the left, `<CategoryChart />` on the right
4. `<RecentTransactions />` below the charts

On mount, fetch summary, monthly breakdown, and category breakdown data via the transaction context. Keep the layout clean, well-spaced, and responsive.

---

## Phase 8 — Transactions Page

### Step 29: Build the Filter Bar Component

Create `client/src/components/transactions/FilterBar.jsx`. A horizontal bar (wraps on mobile) with three filter controls:

- **Month Picker**: An `<input type="month">` or a custom month selector. Defaults to current month. Sends value as `"YYYY-MM"`.
- **Category Dropdown**: A `<select>` with all category options + an "All Categories" default.
- **Type Dropdown**: A `<select>` with "All", "Income", "Expense".
- A **Clear Filters** button to reset all filters.

On any filter change, update the filters in the transaction context (which triggers a re-fetch).

### Step 30: Build the Transaction List / Table Component

Create `client/src/components/transactions/TransactionList.jsx`. A responsive table (or card list on mobile) showing all transactions:

- Columns: Date, Type (badge), Category (badge), Description, Amount
- Amount: green text with "+" for income, red text with "-" for expense
- Each row has Edit and Delete action buttons (icon buttons)
- Sort by date descending by default
- Show "No transactions found" empty state with an illustration or icon
- Show loading skeleton while fetching

Delete action: show a confirmation dialog before calling `removeTransaction`.

### Step 31: Build the Transaction Form Modal

Create `client/src/components/transactions/TransactionForm.jsx`. A modal/dialog overlay with a form:

- **Type Toggle**: Two buttons (Income / Expense) — toggle style to show active selection
- **Category Dropdown**: Dynamic options based on selected type (income categories vs expense categories)
- **Amount Input**: Number input, min 0.01, step 0.01
- **Date Picker**: `<input type="date">`, defaults to today
- **Description Input**: Text input, optional, maxlength 200
- **Submit Button**: "Add Transaction" (create mode) or "Update Transaction" (edit mode)
- **Cancel Button**: Closes the modal

The form works in two modes: **create** (empty fields) and **edit** (pre-filled with existing transaction data). On submit, call `addTransaction` or `editTransaction` from context, show success toast, and close the modal.

### Step 32: Assemble the Transactions Page

Create `client/src/pages/Transactions.jsx`. Compose the page:

1. Page title: "Transactions" + an "Add Transaction" button (top right)
2. `<FilterBar />`
3. `<TransactionList />`
4. `<TransactionForm />` (shown/hidden via local state, opened by "Add Transaction" button or Edit button in the list)

On mount, fetch transactions with current filters.

---

## Phase 9 — Polish, UX & Edge Cases

### Step 33: Add Loading Skeletons & Empty States

Create reusable skeleton components: `client/src/components/ui/Skeleton.jsx` (a pulsing gray placeholder block). Apply skeleton loading states consistently across: Summary cards, Charts, Transaction list. Create meaningful empty states with icons and helpful messages (e.g., "No transactions yet. Add your first one!"). Create an `ErrorMessage` component for API error display.

### Step 34: Add Form Validation & Error Handling

Add client-side validation to the Transaction form: required fields highlighted in red with error messages below, prevent submit if invalid. Sanitize user inputs on the client side as well — strip leading/trailing whitespace, enforce maxlength constraints. Add client-side validation to Login/Register forms similarly (email format, password min length). Show toast notifications for all API success and error responses — never display raw error objects or stack traces to the user. Handle network errors gracefully (show retry option or offline message). Never log sensitive data (tokens, passwords, financial details) to the browser console in production.

### Step 35: Make the App Fully Responsive

Review every component for mobile responsiveness:

- Sidebar collapses into a hamburger menu overlay on screens < 768px
- Dashboard charts stack vertically on mobile
- Transaction table converts to card layout on mobile
- Filter bar wraps gracefully
- Modal is full-screen on mobile, centered on desktop
- All touch targets are minimum 44x44px

Test at breakpoints: 375px (mobile), 768px (tablet), 1024px+ (desktop).

---

## Phase 10 — Environment & Deployment

### Step 36: Prepare Environment Configuration

Create `server/.env.example` with all required variables documented using safe placeholder values (never real credentials). Create `client/.env.example` with `VITE_API_URL`. Double-check that `.env`, `.env.local`, `.env.production` are all listed in `.gitignore` — since this repo is public, a single missed `.env` file means all secrets (database connection string, JWT secret) are permanently exposed in git history. Verify the app works with environment variables properly loaded in both dev and production modes. Add a startup check in `server/src/index.js` that validates all required environment variables exist and exits with a clear error message if any are missing (e.g., if `JWT_SECRET` is undefined, log `"FATAL: JWT_SECRET is not set"` and `process.exit(1)`).

### Step 37: Prepare Backend for Render Deployment

In `server/package.json`, ensure `"start": "node src/index.js"` is defined. Set `NODE_ENV=production` in Render environment variables. Verify CORS is configured to accept **only** the exact Netlify frontend URL (not `*`). Add a health check route `GET /api/health` that returns `200 { status: "ok", timestamp: Date.now() }` — this route should NOT expose server version, environment, or dependency information. Document deployment steps for Render in README (set environment variables, connect repo, set build/start commands).

### Step 38: Prepare Frontend for Netlify Deployment

Add `client/public/_redirects` with content `/* /index.html 200` for SPA routing. Set `VITE_API_URL` to the Render backend URL in Netlify environment variables. Verify the production build works: `npm run build` and test the `dist/` output. Document deployment steps for Netlify in README.

---

## Phase 11 — Documentation

### Step 39: Write the README

Create a professional `README.md` at the project root with:

- Project title, description, and a feature list
- Tech stack badges (MongoDB, Express, React, Node.js, TailwindCSS, Recharts)
- Screenshots section (placeholder for Dashboard and Transactions page screenshots)
- Prerequisites (Node.js, MongoDB)
- Installation & setup instructions (clone, install deps, configure env, run dev)
- API endpoints documentation table
- Folder structure overview
- Deployment instructions (Render + Netlify)
- License (MIT)

---

## Summary of All Endpoints

| Method | Endpoint                      | Description                        | Auth |
|--------|-------------------------------|------------------------------------|------|
| POST   | `/api/auth/register`          | Register a new user                | No   |
| POST   | `/api/auth/login`             | Login and receive JWT              | No   |
| GET    | `/api/auth/me`                | Get current user profile           | Yes  |
| GET    | `/api/transactions`           | List transactions (with filters)   | Yes  |
| GET    | `/api/transactions/summary`   | Get income/expense/net totals      | Yes  |
| GET    | `/api/transactions/monthly`   | Get monthly breakdown for charts   | Yes  |
| GET    | `/api/transactions/categories`| Get category breakdown for charts  | Yes  |
| POST   | `/api/transactions`           | Create a new transaction           | Yes  |
| PUT    | `/api/transactions/:id`       | Update a transaction               | Yes  |
| DELETE | `/api/transactions/:id`       | Delete a transaction               | Yes  |
| GET    | `/api/health`                 | Health check                       | No   |

---

## Folder Structure

```
s4.6_Expense Tracker Mern/
├── server/
│   ├── src/
│   │   ├── index.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Transaction.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── transactionController.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── authRoutes.js
│   │   │   └── transactionRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validate.js
│   │   │   ├── errorHandler.js
│   │   │   └── validators/
│   │   │       ├── authValidator.js
│   │   │       └── transactionValidator.js
│   │   └── utils/
│   │       ├── generateToken.js
│   │       └── verifyToken.js
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Transactions.jsx
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── layout/
│   │   │   │   └── AppLayout.jsx
│   │   │   ├── ui/
│   │   │   │   └── Skeleton.jsx
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
│   │   │   ├── AuthContext.jsx
│   │   │   └── TransactionContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── transactionService.js
│   │   └── utils/
│   │       └── formatCurrency.js
│   ├── public/
│   │   └── _redirects
│   ├── .env.example
│   └── package.json
├── .gitignore
├── STEPS.md
└── README.md
```

---

## Security Checklist (Public Repo)

Before sharing this project publicly, verify every item below:

### Secrets & Environment
- [ ] `.env` files are listed in `.gitignore` and never committed
- [ ] `.env.example` files contain only placeholder values — no real credentials
- [ ] `JWT_SECRET` is a cryptographically strong random string (min 32 chars)
- [ ] MongoDB connection string uses a dedicated user with minimal privileges (not the admin account)
- [ ] Startup check validates all required env vars exist before the server starts

### Backend Security
- [ ] `helmet()` is active — secure HTTP response headers
- [ ] `express-rate-limit` is applied globally (100 req/15 min) and stricter on auth routes (20 req/15 min)
- [ ] `express-mongo-sanitize` is active — prevents NoSQL injection (`$gt`, `$ne` stripped from input)
- [ ] `hpp()` is active — prevents HTTP Parameter Pollution
- [ ] `express.json({ limit: '10kb' })` — body size is capped
- [ ] CORS origin is set to the exact frontend URL — never `*` in production
- [ ] Password hashing uses bcrypt with salt rounds >= 12
- [ ] Password field has `select: false` on the User model — never returned by default
- [ ] Login returns generic "Invalid credentials" for both wrong email and wrong password (no user enumeration)
- [ ] JWT payload contains only `userId` — no sensitive data
- [ ] All string inputs are validated with `trim()` + `escape()` (XSS prevention)
- [ ] Category and type fields use strict whitelist validation (`.isIn()`)
- [ ] All `:id` route params are validated as valid MongoDB ObjectId format
- [ ] Every query and aggregation pipeline is scoped by `userId` — no cross-user data leaks
- [ ] Request body fields are whitelisted — `req.body` is never spread directly into models
- [ ] Error handler never exposes stack traces or file paths in production
- [ ] Pagination is enforced on list endpoints (max 100 items per page)

### Frontend Security
- [ ] Token is cleared from localStorage on 401 responses and on logout
- [ ] No sensitive data (passwords, tokens, financial details) is logged to browser console
- [ ] Auth pages redirect away if user is already authenticated
- [ ] API errors are displayed as user-friendly messages — never raw error objects
- [ ] Axios instance has a request timeout configured
- [ ] Protected routes verify authentication before rendering
