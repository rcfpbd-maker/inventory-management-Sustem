import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Contact,
  CreditCard,
  BarChart3,
  Settings,
  List,
  Truck,
  Layers,
  RefreshCcw,
  Activity,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: string;
  children?: NavItem[];
  isExternal?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navRoutes: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        title: "Overview",
        href: "/overview",
        icon: LayoutDashboard,
      },
      {
        title: "Users",
        href: "/users",
        icon: Users,
      },
      {
        title: "Inventory",
        href: "/inventory",
        icon: Package,
        children: [
          {
            title: "Product List",
            href: "/inventory",
            icon: List,
          },
          {
            title: "Stock",
            href: "/inventory/stock",
          },
          {
            title: "Suppliers",
            href: "/suppliers",
            icon: Truck,
          },
          {
            title: "Categories",
            href: "/inventory/categories",
            icon: Layers,
          },
        ],
      },
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
        children: [
          {
            title: "Sales Orders",
            href: "/orders/sales",
          },
          {
            title: "Purchase Orders",
            href: "/orders/purchase",
          },
          {
            title: "Returns",
            icon: RefreshCcw,
            children: [
              {
                title: "Sales Returns",
                href: "/orders/returns/sales",
              },
              {
                title: "Purchase Returns",
                href: "/orders/returns/purchase",
              },
            ],
          },
        ],
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Contact,
      },
      {
        title: "Finance",
        icon: CreditCard,
        children: [
          {
            title: "Income",
            href: "/finance/income",
          },
          {
            title: "Expenses",
            href: "/finance/expense",
          },
        ],
      },
      {
        title: "Reports",
        icon: BarChart3,
        children: [
          {
            title: "Daily Sales",
            href: "/reports/daily-sales",
          },
          {
            title: "User Performance",
            href: "/reports/user-performance",
          },
          {
            title: "Profit & Loss",
            href: "/reports/profit-loss",
          },
        ],
      },
    ],
  },
  {
    label: "Logistics",
    items: [
      {
        title: "Couriers",
        href: "/logistics/couriers",
        icon: Truck,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        children: [
          {
            title: "Audit Logs",
            href: "/settings/audit-logs",
            icon: Activity,
          },
        ],
      },
    ],
  },
];
