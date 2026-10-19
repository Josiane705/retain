# Retain: Personal Expense & Budget Manager

Retain is a full-stack web app for recording personal expenses, setting a monthly budget and seeing where your money goes. Admins can manage expense categories and view platform-wide insights.

## Live application

- **Frontend (deployed app):** https://retain-sable.vercel.app
- **Backend API:** https://retain-api-vmm0.onrender.com

> The backend runs on a free Render plan that sleeps after a period of inactivity. The first request can take about 50 seconds while it wakes up. Open the API link once, wait for `Retain API running`, then use the app.

## Technologies used

**Frontend:** React, TypeScript, Vite, React Router, React Context (authentication), Redux Toolkit (search, filtering and sorting), Axios, plain CSS (responsive).

**Backend:** Node.js, Express, MongoDB with Mongoose, JSON Web Tokens (JWT), bcryptjs.

**Hosting:** Vercel (frontend), Render (backend), MongoDB Atlas (database).

## Main features

**Users**
- Sign up, sign in and sign out, with sessions kept across page refreshes.
- Create, view, update and delete your own expenses (title, amount, category, date, payment method and optional notes).
- Search by title or notes, filter by category, payment method, date range and amount range, and sort by date or amount.
- Pagination for large lists of expenses.
- Monthly budget with total spent, remaining budget, and a status of **within**, **approaching** (80% or more used) or **over** budget.
- Dashboard with total spending for the selected month, remaining budget, highest expense, spending by category and recent expenses.
- Responsive layout for phones, tablets and desktops.

**Admins**
- Protected admin dashboard (role-based access).
- Create, update and delete expense categories. Deleting a category moves its expenses to the default **Uncategorized** category.
- Platform insights: total users, total expenses, total value, expenses this month, spending per category, top 5 and bottom 5 categories, recently added expenses and recently registered users.

## How state is managed

- **Authentication (React Context):** `AuthContext` handles sign up, sign in, sign out and the user role. `ProtectedRoute` and `AdminRoute` use it to guard pages.
- **Search, filters and sorting (Redux):** `filtersSlice` holds all search, filter, sort and page state, and the expenses page reloads data from the API when it changes.

## Project structure

```
retain/
├── backend/
│   ├── config/        database connection and category seeding
│   ├── controllers/   auth, categories, expenses, budgets, dashboard, admin
│   ├── middleware/    JWT protection and admin-only check
│   ├── models/        User, Category, Expense, Budget
│   ├── routes/        API routes
│   ├── utils/         budget summary helper
│   └── server.js
└── frontend/
    └── src/
        ├── components/  layout, route guards, filters, list, category manager
        ├── context/     AuthContext
        ├── hooks/       useAuth
        ├── pages/       sign in, sign up, dashboard, expenses, admin
        ├── services/    Axios instance and API functions
        ├── store/       Redux store and filters slice
        ├── types/       TypeScript types
        └── utils/       formatting helpers
```

## Running locally

**Requirements:** Node.js 18 or newer, and MongoDB (local or Atlas).

### 1. Clone the repository

```bash
git clone https://github.com/Josiane705/retain.git
cd retain
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/retain
JWT_SECRET=use_a_long_random_string
ADMIN_EMAIL=your_admin_email@example.com
```

Start it:

```bash
npm run dev
```

The first start creates the default **Uncategorized** category and some starter categories. The user who signs up with `ADMIN_EMAIL` becomes the admin. Everyone else is a normal user.

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Start it:

```bash
npm run dev
```

Open the address that Vite prints (usually http://localhost:5173).

## API reference

Base URL: `/api`. All routes except sign up and sign in need the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Create an account, returns a token and user |
| POST | `/auth/signin` | Sign in, returns a token and user |
| GET | `/auth/me` | Current user |

### Expenses (own data only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/expenses` | List with filters, sorting and pagination |
| POST | `/expenses` | Create an expense |
| GET | `/expenses/:id` | One expense |
| PUT | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |

Query parameters for `GET /expenses`: `search`, `category`, `paymentMethod`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `sortBy` (`date` or `amount`), `order` (`asc` or `desc`), `page`, `limit`.

### Budget and dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets?month=YYYY-MM` | Budget summary for a month |
| PUT | `/budgets` | Set or update the budget (`month`, `amount`) |
| GET | `/dashboard?month=YYYY-MM` | Total spent, highest expense, spending by category, recent expenses |

### Categories

| Method | Endpoint | Access |
|---|---|---|
| GET | `/categories` | Any signed-in user |
| POST | `/categories` | Admin only |
| PUT | `/categories/:id` | Admin only |
| DELETE | `/categories/:id` | Admin only |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/insights` | Platform-wide statistics (admin only) |

## Security notes

- Passwords are hashed with bcrypt.
- Every expense and budget query is filtered by the signed-in user, so users cannot read or change each other's data.
- Admin endpoints are protected on the server by a role check, and admin pages are protected on the client by `AdminRoute`.

## Author

Josiane Mukeshimana, African Leadership University.# retain