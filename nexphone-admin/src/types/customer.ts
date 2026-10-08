export type CustomerStatus = "active" | "disabled";

export type CustomerTier = "VIP" | "Enterprise" | "Pro" | "Regular";

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerSecurity {
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
  lastLoginIp: string;
}

export interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: string;
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  itemCount: number;
}

export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  avatarUrl?: string;
  status: CustomerStatus;
  tier: CustomerTier;
  address: CustomerAddress;
  metrics: CustomerMetrics;
  security: CustomerSecurity;
  recentOrders?: CustomerOrderSummary[];
  notes?: string;
  disabledReason?: string;
  disabledAt?: string;
  disabledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummaryMetrics {
  totalCustomers: number;
  activeCustomers: number;
  disabledCustomers: number;
  totalLtv: number;
  avgSpendPerCustomer: number;
  vipCustomers: number;
}

export interface CustomerFilterParams {
  search?: string;
  status?: CustomerStatus | "all";
  tier?: CustomerTier | "all";
  sortBy?: "recent" | "spent_desc" | "orders_desc" | "name_asc";
}

export interface ToggleCustomerStatusPayload {
  customerId: string;
  status: CustomerStatus;
  reason?: string;
  note?: string;
  performedBy?: string;
}
