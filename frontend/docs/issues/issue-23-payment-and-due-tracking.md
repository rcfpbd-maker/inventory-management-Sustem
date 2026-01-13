# Issue #23: Payment Tracking & Due Amount Management

## Priority: High 🔴 | Status: Completed

## Description
Implement a robust payment tracking system that supports multiple methods, partial payments, and automated due calculation.

## Backend Implementation Summary (Completed)
- **Database**: New `payments` table created. Added `payment_status` to `orders`.
- **API**:
    - `POST /api/payments`: Records a payment and automatically updates the order's `payment_status` (UNPAID, PARTIAL, PAID).
    - `GET /api/payments/order/:orderId`: Retrieves payment history for an order.

## Frontend Implementation (Completed)
- ✅ **Payment History View**: Displays all payments with method, channel, transaction ID, and status.
- ✅ **Add Payment Dialog**: Form with amount, method (Cash, bKash, Nagad, Rocket, Bank Transfer, Card), channel, and transaction ID.
- ✅ **Due Amount Tracking**: Shows remaining balance in payment history.
- ✅ **Integration**: Fully integrated into Order Details Dialog.

## Business Logic
- **Due Amount Calculation**: `order.total_amount - sum(payments)`.
- **Payment Validation**: Ensures `paid_amount` does not exceed `order.total_amount`.
- **COD Auto Due**: Cash on Delivery orders should start with 'DUE' status.
