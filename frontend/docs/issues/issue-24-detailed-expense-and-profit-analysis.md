# Issue #24: Detailed Expense Tracking & Profit Analysis

## Priority: Medium 🟡 | Status: Completed

## Description
Enhance expense tracking to include granular order-level costs (product, packaging, courier, ads) and calculate net profit.

## Backend Implementation Summary (Completed)
- **Database**: Updated `expenses` table with `product_cost`, `packaging_cost`, `courier_cost`, `ad_cost`, and `total_expense`.
- **API**:
    - `POST /api/expenses`: Automatically calculates `total_expense` based on input costs.

## Required Frontend Features
- **Advanced Expense Form**: Fields for granular cost breakdown during expense entry.
- **Profit Dashboard**: Real-time calculation of Net Profit (`sales - expenses`).
- **Profit per Order**: View the margin for individual sales.

## Business Logic
- **Total Expense Calculation**: `product_cost + packaging_cost + courier_cost + ad_cost + base_amount`.
- **Net Profit**: `Total Revenue - Total Expenses`.
