export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  categoryId: string;
  categoryName?: string;
  category?: Category;
  description?: string;
  imageUrl?: string;
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
  salePrice?: number;
  purchasePrice?: number;
  sale_price?: number;
  purchase_price?: number;
  stock_quantity?: number;
}

export interface ProductPayload {
  name: string;
  sku: string;
  price: number; // Used for UI state
  costPrice: number; // Used for UI state
  stock: number; // Used for UI state

  // Backend expected fields
  salePrice?: number;
  purchasePrice?: number;
  stockQuantity?: number;

  minStock: number;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  status?: "active" | "inactive" | "archived";
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "STAFF" | "SUPER_ADMIN" | "ADMIN";
  permissions: Record<string, boolean>;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password?: string;
  otp?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  status?: boolean;
  message: string;
  data?: T;
  Data?: T;
  status_code?: number;
  meta?: {
    pagination?: Pagination;
  };
  Error?: unknown;
  error_message?: string;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPayload {
  name: string;
  phone?: string;
  email?: string;
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPayload {
  name: string;
  phone?: string;
  email?: string;
}

// Category payload type (Category interface already exists)
export interface CategoryPayload {
  name: string;
  description?: string;
  parentId?: string | null;
}

// Return types
export interface OrderReturn {
  id: string;
  orderId: string;
  type: "SALE_RETURN" | "PURCHASE_RETURN" | "RETURN"; // RETURN is legacy/generic
  amount: number;
  reason: string;
  date: string;
  customer_name?: string;
  supplier_name?: string;
  order_type?: string;
}

export interface ReturnPayload {
  orderId: string;
  type: "SALE_RETURN" | "PURCHASE_RETURN";
  amount: number;
  reason: string;
  date?: string;
}

// Order types
export type OrderType = "SALE" | "PURCHASE" | "SALE_RETURN" | "PURCHASE_RETURN";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product_name?: string;
  quantity: number;
  price: number | string;
  total: number | string;
}

export interface Order {
  id: string;
  type: OrderType;
  date: string;
  customerId?: string;
  customer_name?: string;
  supplierId?: string;
  supplier_name?: string;
  total_amount: number | string;
  status?: string;
  payment_status?: string;
  confirmed_by?: string;
  confirmation_status?: string;
  courier_id?: string;
  courier_name?: string;
  tracking_id?: string;
  customer_phone?: string;
  items?: OrderItem[];
  platform?: string;
  delivery_type?: string;
  createdAt: string;
}

export interface OrderPayload {
  type: OrderType;
  date?: string;
  customerId?: string;
  supplierId?: string;
  totalAmount: number;
  platform?: string;
  deliveryType?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}

// Finance types
export interface Income {
  id: string;
  source: string;
  amount: number | string;
  category?: string;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface IncomePayload {
  source: string;
  amount: number;
  category?: string;
  notes?: string;
  date?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number | string;
  vendor?: string;
  notes?: string;
  date: string;
  productCost?: number;
  packagingCost?: number;
  courierCost?: number;
  adCost?: number;
  createdAt: string;
}

export interface ExpensePayload {
  category: string;
  amount: number;
  vendor?: string;
  notes?: string;
  date?: string;
  productCost?: number;
  packagingCost?: number;
  courierCost?: number;
  adCost?: number;
}

// Report types
export interface ProfitLossReport {
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  profitOrLoss: number;
  status: "Profit" | "Loss";
}

export interface DailyLedgerReport {
  date: string;
  incomes: Income[];
  expenses: Expense[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
  };
}

export interface DailySalesData {
  date: string;
  summary: {
    orderCount: number;
    totalSales: number;
    averageOrderValue: number;
  };
  hourlySales: {
    hour: number;
    sales: number;
  }[];
  productBreakdown: {
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  paymentBreakdown: {
    status: string;
    count: number;
  }[];
}

export interface StaffMetrics {
  userId: string;
  staffName: string;
  email?: string;
  orderCount: number;
  totalSales: number;
  averageOrderValue: number;
}

export interface UserPerformanceData {
  period: string;
  startDate: string;
  endDate: string;
  summary?: {
    totalStaff: number;
    totalOrders: number;
    totalRevenue: number;
  };
  leaderboard?: StaffMetrics[];
  staff?: StaffMetrics;
}

// Payment types
export interface Payment {
  id: string;
  orderId: string;
  amount: number | string;
  paymentMethod: string;
  paymentChannel?: string;
  transactionId?: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  date: string;
  createdAt?: string;
}

export interface PaymentPayload {
  orderId: string;
  amount: number;
  paymentMethod: string;
  paymentChannel?: string;
  transactionId?: string;
  status?: "COMPLETED" | "PENDING" | "FAILED";
  date?: string;
}

// Audit types
export interface AuditLog {
  id: string;
  event: string;
  userId?: string;
  timestamp: string;
}

// User permission and status update types
export interface UserPermissionsPayload {
  permissions: Record<string, boolean>;
}

export interface UserStatusPayload {
  status: "active" | "inactive";
}
