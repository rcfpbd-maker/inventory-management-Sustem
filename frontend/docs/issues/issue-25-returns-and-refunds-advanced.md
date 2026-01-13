# Issue #25: Order Returns & Refunds Advanced

## Priority: Medium 🟡 | Status: Backend Implemented / Frontend Pending

## Description
Manage order returns and refunds with automated status updates and future stock integration.

## Backend Implementation Summary (Completed)
- **Database**: New `returns_refunds` table created.
- **API**:
    - `POST /api/returns`: Records a return/refund and moves order status to 'RETURNED'.
    - `GET /api/returns/order/:orderId`: View return history for an order.

## Required Frontend Features
- **Process Return UI**: Button on order details to initiate a return or refund.
- **Return Form**: Capture reason, type (Return vs Refund), and amount.
- **Returns List**: Dashboard for tracking processed returns.

## Business Logic
- **Stock Adjustment**: (Pending) Logic to automatically re-add returned items to stock.
- **Refund Validation**: Refund amount cannot exceed original total paid amount.
