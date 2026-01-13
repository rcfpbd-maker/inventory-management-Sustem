# Issue #26: Logistics & Courier Integration

## Priority: Low 🔵 | Status: Backend Implemented / Frontend Pending

## Description
Manage courier service providers and track individual order shipments via tracking IDs.

## Backend Implementation Summary (Completed)
- **Database**: New `couriers` table. Added `courier_id` and `tracking_id` to `orders`.
- **API**:
    - `CRUD /api/couriers`: Manage courier list.
    - `PUT /api/orders/:id/courier`: Assign a courier and tracking ID to an order.

## Required Frontend Features
- **Courier Management Page**: List, add, and edit courier services (e.g., RedX, Pathao, Steadfast).
- **Shipment Assignment**: Dropdown on the order management page to select a courier and input the tracking number.
- **Tracking Links**: (Future) Auto-generate tracking links based on provider and ID.
