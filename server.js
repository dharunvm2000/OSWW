const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee
app.post('/api/employees', async (req, res) => {
  try {
    const { name, baseSalary } = req.body;
    const employee = await prisma.employee.create({
      data: { name, baseSalary: parseFloat(baseSalary) }
    });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee with advances
app.get('/api/employees/:id/balance', async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        advances: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const totalAdvances = employee.advances.reduce((sum, adv) => sum + adv.amount, 0);
    const balance = employee.baseSalary - totalAdvances;

    res.json({
      employee,
      totalAdvances,
      balance,
      remainingSalary: balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all employees with balances
app.get('/api/employees/balances', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        advances: true
      },
      orderBy: { name: 'asc' }
    });

    const employeesWithBalances = employees.map(emp => {
      const totalAdvances = emp.advances.reduce((sum, adv) => sum + adv.amount, 0);
      return {
        ...emp,
        totalAdvances,
        balance: emp.baseSalary - totalAdvances,
        remainingSalary: emp.baseSalary - totalAdvances
      };
    });

    res.json(employeesWithBalances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add advance
app.post('/api/advances', async (req, res) => {
  try {
    const { employeeId, amount, date, note } = req.body;
    const advance = await prisma.advance.create({
      data: {
        employeeId: parseInt(employeeId),
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        note: note || null
      }
    });
    res.json(advance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all advances
app.get('/api/advances', async (req, res) => {
  try {
    const advances = await prisma.advance.findMany({
      include: {
        employee: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(advances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { expenseDate, category, amount, paidByEmployeeId, description } = req.body;
    const expense = await prisma.expense.create({
      data: {
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        category,
        amount: parseFloat(amount),
        paidByEmployeeId: paidByEmployeeId ? parseInt(paidByEmployeeId) : null,
        description: description || null
      },
      include: {
        paidByEmployee: {
          select: { id: true, name: true }
        }
      }
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all expenses with filters
app.get('/api/expenses', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    const where = {};
    
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }
    
    if (category) {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        paidByEmployee: {
          select: { id: true, name: true }
        }
      },
      orderBy: { expenseDate: 'desc' }
    });
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly spending summary
app.get('/api/dashboard/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const categoryBreakdown = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({
      year: targetYear,
      month: targetMonth,
      totalSpending,
      categoryBreakdown,
      expenseCount: expenses.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee advances summary
app.get('/api/dashboard/advances', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        advances: true
      }
    });

    const summary = employees.map(emp => {
      const totalAdvances = emp.advances.reduce((sum, adv) => sum + adv.amount, 0);
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        baseSalary: emp.baseSalary,
        totalAdvances,
        remainingSalary: emp.baseSalary - totalAdvances
      };
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.expense.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete advance
app.delete('/api/advances/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.advance.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

