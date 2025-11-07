# OSWW Expense Tracker

A comprehensive daily expense tracking system with employee advance management and admin dashboard.

## Features

### 🔹 Expense Management
- Add daily expenses with date, category, amount, paid by (Employee/Owner), and optional description
- Filter expenses by date range and category
- View all expenses in a detailed table

### 🔹 Employee Advance Tracking
- Track employee advances with date and notes
- Automatic balance calculation for each employee
- Monthly salary calculation: Fixed Salary − Advance used
- View running balance for each employee

### 🔹 Admin Dashboard
- Total monthly spending overview
- Category-wise expense breakdown
- Employee advances summary
- Real-time balance tracking

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database (Vercel Postgres or local PostgreSQL)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Using Vercel Postgres
1. Create a Vercel Postgres database at [vercel.com](https://vercel.com)
2. Copy your connection string

#### Option B: Using Local PostgreSQL
1. Create a database:
```sql
CREATE DATABASE osww_expense;
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/osww_expense?schema=public"
PORT=3000
```

For Vercel Postgres, use the connection string provided by Vercel.

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate
```

This will create three tables:
- `employees` - Employee information
- `advances` - Employee advance records
- `expenses` - Daily expense records

### 5. Start the Server

```bash
npm start
```

Or for development:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### 6. Access the Application

- Open `http://localhost:3000` in your browser
- Navigate to "Expense Tracker" from the main page
- Or directly access `http://localhost:3000/expense.html`

## Usage

### Adding Employees
Before adding expenses or advances, you'll need to add employees. You can do this via the API:

```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "baseSalary": 50000}'
```

Or use Prisma Studio:
```bash
npm run prisma:studio
```

### Adding Expenses
1. Go to the "Expenses" tab
2. Fill in the expense form:
   - Date
   - Category (Fuel, Material, Food, Misc)
   - Amount
   - Paid By (Employee or Owner)
   - Description (optional)
3. Click "Add Expense"

### Adding Employee Advances
1. Go to the "Advances" tab
2. Fill in the advance form:
   - Employee
   - Date
   - Amount
   - Note (optional)
3. Click "Add Advance"
4. The employee balance will automatically update

### Viewing Dashboard
1. Go to the "Dashboard" tab
2. Select year and month
3. View monthly spending summary and employee advances

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/balances` - Get all employees with balances
- `GET /api/employees/:id/balance` - Get specific employee balance

### Expenses
- `GET /api/expenses` - Get all expenses (with optional filters: startDate, endDate, category)
- `POST /api/expenses` - Create expense
- `DELETE /api/expenses/:id` - Delete expense

### Advances
- `GET /api/advances` - Get all advances
- `POST /api/advances` - Create advance
- `DELETE /api/advances/:id` - Delete advance

### Dashboard
- `GET /api/dashboard/monthly?year=2025&month=1` - Get monthly spending
- `GET /api/dashboard/advances` - Get employee advances summary

## Database Schema

### Employees Table
- `id` (int, primary key)
- `name` (string)
- `baseSalary` (float)
- `createdAt`, `updatedAt` (timestamps)

### Advances Table
- `id` (int, primary key)
- `employeeId` (int, foreign key)
- `date` (date)
- `amount` (float)
- `note` (string, optional)
- `createdAt`, `updatedAt` (timestamps)

### Expenses Table
- `id` (int, primary key)
- `expenseDate` (date)
- `category` (string)
- `amount` (float)
- `paidByEmployeeId` (int, foreign key, nullable)
- `description` (string, optional)
- `createdAt`, `updatedAt` (timestamps)

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your Vercel Postgres connection string

4. Run migrations:
```bash
vercel env pull
npm run prisma:migrate
```

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` in `.env` file
- Ensure PostgreSQL is running (if using local)
- Check firewall settings for remote databases

### Prisma Issues
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply migrations

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 3000

## License

Internal Use Only - OSWW

