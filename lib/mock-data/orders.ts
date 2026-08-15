// Mock orders data

export type OrderStatus = "Pending" | "Confirmed" | "Processing" | "Ready" | "Delivered" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Partial" | "Paid";

export interface OrderItem {
  product: string;
  sku: string;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customer: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  notes?: string;
  date: string;
}

export const orders: Order[] = [
  {
    id: "ORD-001",
    customer: "Emeka Obi",
    customerId: "C001",
    items: [
      { product: "Classic Pams",    sku: "MLZ-CP-001", color: "Black",  size: "EU 41", qty: 2, unitPrice: 12_000 },
      { product: "Leather Sandals", sku: "MLZ-LS-002", color: "Brown",  size: "EU 41", qty: 1, unitPrice: 15_500 },
    ],
    totalAmount: 39_500,
    orderStatus: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Transfer",
    date: "2026-08-10",
  },
  {
    id: "ORD-002",
    customer: "Fatima Aliyu",
    customerId: "C002",
    items: [
      { product: "Oxford Shoes", sku: "MLZ-OX-005", color: "Brown", size: "EU 39", qty: 1, unitPrice: 32_000 },
    ],
    totalAmount: 32_000,
    orderStatus: "Ready",
    paymentStatus: "Paid",
    paymentMethod: "Transfer",
    date: "2026-08-11",
  },
  {
    id: "ORD-003",
    customer: "Chidi Nwosu",
    customerId: "C003",
    items: [
      { product: "Canvas Sneakers",  sku: "MLZ-CN-004", color: "White", size: "EU 42", qty: 2, unitPrice: 18_000 },
      { product: "Comfort Slippers", sku: "MLZ-CS-003", color: "Black", size: "EU 42", qty: 1, unitPrice: 7_000  },
    ],
    totalAmount: 43_000,
    orderStatus: "Processing",
    paymentStatus: "Partial",
    paymentMethod: "POS",
    date: "2026-08-12",
  },
  {
    id: "ORD-004",
    customer: "Biodun Adeyemi",
    customerId: "C005",
    items: [
      { product: "Leather Moccasins", sku: "MLZ-LM-007", color: "Brown", size: "EU 42", qty: 1, unitPrice: 26_000 },
    ],
    totalAmount: 26_000,
    orderStatus: "Confirmed",
    paymentStatus: "Unpaid",
    paymentMethod: "Cash",
    date: "2026-08-12",
  },
  {
    id: "ORD-005",
    customer: "Ngozi Okonkwo",
    customerId: "C006",
    items: [
      { product: "Sport Sandals", sku: "MLZ-SS-006", color: "Tan",   size: "EU 38", qty: 2, unitPrice: 9_000 },
      { product: "Sport Sandals", sku: "MLZ-SS-006", color: "Black", size: "EU 39", qty: 2, unitPrice: 9_000 },
    ],
    totalAmount: 36_000,
    orderStatus: "Pending",
    paymentStatus: "Unpaid",
    paymentMethod: "Cash",
    date: "2026-08-12",
  },
  {
    id: "ORD-006",
    customer: "Kelechi Okafor",
    customerId: "C009",
    items: [
      { product: "Classic Pams", sku: "MLZ-CP-001", color: "Brown", size: "EU 41", qty: 5, unitPrice: 12_000 },
    ],
    totalAmount: 60_000,
    orderStatus: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Transfer",
    date: "2026-08-08",
  },
  {
    id: "ORD-007",
    customer: "Aisha Mohammed",
    customerId: "C008",
    items: [
      { product: "Leather Sandals", sku: "MLZ-LS-002", color: "Cream", size: "EU 37", qty: 2, unitPrice: 15_500 },
    ],
    totalAmount: 31_000,
    orderStatus: "Cancelled",
    paymentStatus: "Unpaid",
    paymentMethod: "Cash",
    notes: "Customer changed their mind",
    date: "2026-08-07",
  },
];
