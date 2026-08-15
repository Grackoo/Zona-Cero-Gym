export interface Member {
  id: string;
  full_name: string;
  member_id: string;
  plan_type: string;
  status: 'Active' | 'Overdue' | 'Frozen';
  last_visit: string;
  avatar_url?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: string;
  avatar_url?: string;
}
