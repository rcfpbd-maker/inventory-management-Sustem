# Issue #27: Advanced Reporting & Role-Based Control

## Priority: High 🔴 | Status: Not Implemented

## Description
Implement advanced analytics, platform-wise data filtering, and restrict sensitive information based on user roles.

## Required Features
- **Reporting**:
    - Platform-wise order count (Facebook, Website, etc.).
    - Payment Due List (orders with balance > 0).
    - Profit per order report.
    - Employee-wise order performance.
    - Date range filters for all reports.
- **Security & RBAC**:
    - **Staff Restriction**: Prevent staff from deleting orders.
    - **Finance Visibility**: Restrict profit and detailed expense views to Admin/Super Admin.
    - **Action Logs**: Track who updated status or assigned couriers.

## Technical Requirements
- Update `reportsController.js` with new SQL queries for platform/performance analysis.
- Middleware enhancements in `server/src/middleware/authMiddleware.js` for granular permissions.
- Frontend components for filtering and restricted visibility.
