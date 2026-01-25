import pool from "../config/db.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";

export const getProfitLoss = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    // Total Sales Revenue (Only Delivered Orders)
    const salesQuery = `SELECT SUM(total_amount) as total FROM orders WHERE type = 'SALE' AND status = 'DELIVERED' AND date >= ? AND date <= ?`;
    const [salesRows] = await pool.query(salesQuery, [start, end]);
    const totalRevenue = salesRows[0].total || 0;

    // Detailed Expenses
    const expenseQuery = `
      SELECT 
        SUM(amount) as basicExpense,
        SUM(product_cost) as productCost,
        SUM(packaging_cost) as packagingCost,
        SUM(courier_cost) as courierCost,
        SUM(ad_cost) as adCost,
        SUM(total_expense) as totalExpense
      FROM expenses 
      WHERE date >= ? AND date <= ?
    `;
    const [expenseRows] = await pool.query(expenseQuery, [start, end]);
    const summary = expenseRows[0];

    const netProfit = totalRevenue - (summary.totalExpense || 0);

    sendResponse(res, 200, "Advanced Profit/Loss Report", {
      startDate: start,
      endDate: end,
      totalRevenue,
      expenses: {
        productCost: summary.productCost || 0,
        packagingCost: summary.packagingCost || 0,
        courierCost: summary.courierCost || 0,
        adCost: summary.adCost || 0,
        otherExpense: summary.basicExpense || 0,
        total: summary.totalExpense || 0
      },
      netProfit,
      status: netProfit >= 0 ? "Profit" : "Loss",
    });
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const getOrderProfitReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id as orderId, 
        o.date, 
        o.total_amount as revenue,
        e.total_expense as expense,
        (o.total_amount - IFNULL(e.total_expense, 0)) as profit
      FROM orders o
      LEFT JOIN expenses e ON o.id = e.order_id
      WHERE o.type = 'SALE' AND o.status = 'DELIVERED'
      ORDER BY o.date DESC
    `;
    const [rows] = await pool.query(query);
    sendResponse(res, 200, "Order-wise Profit Analysis", rows);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const getDailyLedger = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Income for the day
    const incomeQuery = `SELECT * FROM income WHERE DATE(date) = ?`;
    const [incomes] = await pool.query(incomeQuery, [targetDate]);

    // Expenses for the day
    const expenseQuery = `SELECT * FROM expenses WHERE DATE(date) = ?`;
    const [expenses] = await pool.query(expenseQuery, [targetDate]);

    const totalIncome = incomes.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
    const totalExpense = expenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    sendResponse(res, 200, "Daily Ledger Report", {
      date: targetDate,
      incomes,
      expenses,
      summary: {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
      },
    });
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const getDailySales = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];

    // 1. Summary Analytics
    const summaryQuery = `
      SELECT 
        COUNT(*) as orderCount,
        SUM(total_amount) as totalSales,
        AVG(total_amount) as averageOrderValue
      FROM orders 
      WHERE type = 'SALE' AND status = 'DELIVERED' AND DATE(date) = ?
    `;
    const [summaryRows] = await pool.query(summaryQuery, [targetDate]);
    const summary = summaryRows[0];

    // 2. Hourly Sales (for Chart)
    const hourlyQuery = `
      SELECT 
        HOUR(date) as hour,
        SUM(total_amount) as sales
      FROM orders 
      WHERE type = 'SALE' AND status = 'DELIVERED' AND DATE(date) = ?
      GROUP BY HOUR(date)
      ORDER BY hour
    `;
    const [hourlyRows] = await pool.query(hourlyQuery, [targetDate]);

    // 3. Product Breakdown
    const productQuery = `
      SELECT 
        p.name as productName,
        SUM(oi.quantity) as quantity,
        SUM(oi.total) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.type = 'SALE' AND o.status = 'DELIVERED' AND DATE(o.date) = ?
      GROUP BY p.id
      ORDER BY revenue DESC
    `;
    const [productRows] = await pool.query(productQuery, [targetDate]);

    // 4. Payment Status Breakdown
    const paymentQuery = `
      SELECT 
        payment_status as status,
        COUNT(*) as count
      FROM orders 
      WHERE type = 'SALE' AND status = 'DELIVERED' AND DATE(date) = ?
      GROUP BY payment_status
    `;
    const [paymentRows] = await pool.query(paymentQuery, [targetDate]);

    sendResponse(res, 200, "Daily Sales Report", {
      date: targetDate,
      summary: {
        orderCount: summary.orderCount || 0,
        totalSales: summary.totalSales || 0,
        averageOrderValue: summary.averageOrderValue || 0,
      },
      hourlySales: hourlyRows,
      productBreakdown: productRows,
      paymentBreakdown: paymentRows,
    });
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const getUserPerformance = async (req, res) => {
  try {
    const { period = 'monthly', userId } = req.query;

    // Calculate date range based on period
    let startDate, endDate;
    const now = new Date();
    endDate = now.toISOString().split("T")[0];

    switch (period) {
      case 'daily':
        startDate = endDate;
        break;
      case 'weekly':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        startDate = weekAgo.toISOString().split("T")[0];
        break;
      case 'monthly':
      default:
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        startDate = monthAgo.toISOString().split("T")[0];
        break;
    }

    // If specific user requested, get their individual performance
    if (userId) {
      const userQuery = `
        SELECT 
          u.id as userId,
          u.username as staffName,
          COUNT(o.id) as orderCount,
          SUM(o.total_amount) as totalSales,
          AVG(o.total_amount) as averageOrderValue
        FROM users u
        LEFT JOIN orders o ON u.id = o.confirmed_by 
          AND o.type = 'SALE' 
          AND o.status != 'CANCELLED' 
          AND DATE(o.date) >= ? 
          AND DATE(o.date) <= ?
        WHERE u.id = ?
        GROUP BY u.id
      `;
      const [userRows] = await pool.query(userQuery, [startDate, endDate, userId]);

      if (userRows.length === 0) {
        return sendError(res, 404, "User not found");
      }

      return sendResponse(res, 200, "User Performance", {
        period,
        startDate,
        endDate,
        staff: userRows[0],
      });
    }

    // Get leaderboard (all staff performance)
    const leaderboardQuery = `
      SELECT 
        u.id as userId,
        u.username as staffName,
        u.email,
        COUNT(o.id) as orderCount,
        SUM(o.total_amount) as totalSales,
        AVG(o.total_amount) as averageOrderValue
      FROM users u
      LEFT JOIN orders o ON u.id = o.confirmed_by 
        AND o.type = 'SALE' 
        AND o.status != 'CANCELLED' 
        AND DATE(o.date) >= ? 
        AND DATE(o.date) <= ?
      GROUP BY u.id
      HAVING orderCount > 0
      ORDER BY totalSales DESC
    `;
    const [leaderboardRows] = await pool.query(leaderboardQuery, [startDate, endDate]);

    // Calculate summary statistics
    const totalOrders = leaderboardRows.reduce((sum, row) => sum + row.orderCount, 0);
    const totalRevenue = leaderboardRows.reduce((sum, row) => sum + (row.totalSales || 0), 0);

    sendResponse(res, 200, "User Performance Report", {
      period,
      startDate,
      endDate,
      summary: {
        totalStaff: leaderboardRows.length,
        totalOrders,
        totalRevenue,
      },
      leaderboard: leaderboardRows,
    });
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const getPlatformSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0];
    const end = endDate || new Date().toISOString().split("T")[0];

    const query = `
      SELECT 
        platform,
        COUNT(*) as order_count,
        SUM(total_amount) as total_amount
      FROM orders 
      WHERE type = 'SALE' AND status = 'DELIVERED' AND date >= ? AND date <= ?
      GROUP BY platform
      ORDER BY total_amount DESC
    `;
    const [rows] = await pool.query(query, [start, end]);
    sendResponse(res, 200, "Platform Sales Report", rows);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const getDueList = async (req, res) => {
  try {
    // Current due list (where total_amount > sum of payments)
    const query = `
      SELECT 
        o.id as order_id,
        o.date,
        c.name as customer_name,
        c.phone as customer_phone,
        o.total_amount,
        o.platform,
        IFNULL(SUM(p.amount), 0) as paid_amount,
        (o.total_amount - IFNULL(SUM(p.amount), 0)) as due_amount
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN payments p ON o.id = p.order_id AND p.status = 'COMPLETED'
      WHERE o.type = 'SALE' AND o.status != 'CANCELLED'
      GROUP BY o.id
      HAVING due_amount > 0
      ORDER BY due_amount DESC
    `;
    const [rows] = await pool.query(query);
    sendResponse(res, 200, "Due List Report", rows);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Delivered Sales Revenue (Lifetime)
    const [salesRows] = await pool.query(`SELECT SUM(total_amount) as total FROM orders WHERE type = 'SALE' AND status = 'DELIVERED'`);
    const totalSales = salesRows[0].total || 0;

    // 2. Pending Orders Count
    const [pendingRows] = await pool.query(`SELECT COUNT(*) as count FROM orders WHERE type = 'SALE' AND status = 'PENDING'`);
    const pendingOrdersCount = pendingRows[0].count || 0;

    // 3. Total Customers
    const [customerRows] = await pool.query(`SELECT COUNT(*) as count FROM customers`);
    const totalCustomers = customerRows[0].count || 0;

    // 4. Sales Growth (Last 30 days vs previous 30 days - Quick estimate)
    const [thisMonthRows] = await pool.query(`SELECT SUM(total_amount) as total FROM orders WHERE type = 'SALE' AND status = 'DELIVERED' AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    const [lastMonthRows] = await pool.query(`SELECT SUM(total_amount) as total FROM orders WHERE type = 'SALE' AND status = 'DELIVERED' AND date >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND date < DATE_SUB(NOW(), INTERVAL 30 DAY)`);

    const thisMonth = Number(thisMonthRows[0].total || 0);
    const lastMonth = Number(lastMonthRows[0].total || 0);
    let growth = 0;
    if (lastMonth > 0) {
      growth = ((thisMonth - lastMonth) / lastMonth) * 100;
    }

    sendResponse(res, 200, "Dashboard Statistics", {
      totalSales,
      pendingOrdersCount,
      totalCustomers,
      salesGrowth: growth.toFixed(1) + "%",
      growthTrend: growth >= 0 ? "up" : "down"
    });
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};
