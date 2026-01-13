# Issue #22: Advanced Order Status & Platform Management

## Priority: High 🔴 | Status: Backend Implemented / Frontend Pending

## Description
Enhance sales orders with platform tracking, delivery types, and a formal status transition flow with confirmer tracking.

## Backend Implementation Summary (Completed)
- **Database**: Added `platform`, `status`, `delivery_type`, `confirmed_by`, `confirmation_status` to `orders`.
- **API**: 
    - `PUT /api/orders/:id/status`: Updates order status and logs the confirming user.
    - `POST /api/orders`: Now supports platform and delivery type fields.

## Required Frontend Features
- **Order Creation Update**: Add dropdowns for 'Platform' (Facebook, Website, WhatsApp, Direct) and 'Delivery Type'.
- **Order list**: Display status badges and platform icons.
- **Status Management UI**: A component to change order status (e.g., PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED).
- **Confirmation Flow**: Capture the user who confirms an order.

## Validation & Logic
- **Status Flow Restriction**: Prevent illegal transitions (e.g., cannot move from DELIVERED to PENDING).
- **COD Logic**: Auto-set `payment_status` to 'DUE' if it's a Cash on Delivery order.
