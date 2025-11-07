# Quick Setup Guide

## Step-by-Step Setup

### 1. Install Node.js Dependencies
```bash
cd OSWW-main
npm install
```

### 2. Set Up Database

#### For Vercel Postgres:
1. Go to [vercel.com](https://vercel.com) and create a new project
2. Add a Postgres database
3. Copy the connection string

#### For Local PostgreSQL:
1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE osww_expense;
```

### 3. Create .env File
Create a file named `.env` in the `OSWW-main` folder:

```env
DATABASE_URL="your_database_connection_string_here"
PORT=3000
```

### 4. Initialize Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

### 5. Start Server
```bash
npm start
```

### 6. Add Employees (Optional - via API or Prisma Studio)

**Option A: Using Prisma Studio (Easier)**
```bash
npm run prisma:studio
```
This opens a web interface at http://localhost:5555 where you can add employees.

**Option B: Using API**
```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name": "Employee Name", "baseSalary": 50000}'
```

### 7. Access the Application
- Open browser: http://localhost:3000
- Click on "Expense Tracker" or go to http://localhost:3000/expense.html

## Troubleshooting

**Error: Cannot find module '@prisma/client'**
- Run: `npm install`

**Error: DATABASE_URL is not set**
- Make sure `.env` file exists and has DATABASE_URL

**Error: P1001: Can't reach database server**
- Check your DATABASE_URL connection string
- Ensure database server is running
- Check firewall/network settings

**Port 3000 already in use**
- Change PORT in `.env` file to another number (e.g., 3001)
- Or stop the process using port 3000

