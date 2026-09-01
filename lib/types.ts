export type Ingredient = {
  id: number;
  name: string;
  unit: string;
  cost_per_unit: number;
  stock: number;
  note: string | null;
  created_at: string;
};

export type Equipment = {
  id: number;
  name: string;
  price: number;
  source_url: string | null;
  note: string | null;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  cost: number;
  active: boolean;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  qty: number;
  price: number;
  cost: number;
};

export type Order = {
  id: number;
  customer: string | null;
  channel: string;
  status: string;
  total: number;
  cost_total: number;
  created_at: string;
  order_items?: OrderItem[];
};

export const baht = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n || 0);
