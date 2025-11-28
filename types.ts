
export interface KPI {
  fcr: number;
  fcrChange: number;
  fcr_feed_kg: number;
  fcr_eggs_kg: number;
  eggProductionRate: number;
  eggProductionRateChange: number;
  prod_eggs_today: number;
  prod_hens_total: number;
  feedCostPerEgg: number;
  feedCostPerEggChange: number;
  cost_feed_today_php: number;
  cost_eggs_today: number;
  mortalityRate: number;
  mortalityRateChange: number;
  mort_deaths_7d: number;
  mort_birds_7d_ago: number;
}

export interface Profile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'power-admin' | 'member' | 'editor' | 'viewer';
  photoURL?: string;
}

export interface LivestockFlock {
  id: string;
  type: string;
  age: number;
  headcount: number;
  status: 'Peak Production' | 'Growing' | 'End of Lay' | 'New';
}

export interface Supply {
  item: string;
  category: string;
  stockLevel: string;
  networkStatus: 'Order via Hub' | 'Pledged to Contract' | 'Local Stock';
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  icon: string;
  color: 'red' | 'green' | 'blue';
}

export interface Announcement {
  id: string;
  date: string;
  author: string;
  title: string;
  body: string;
}

export interface MarketPrice {
    id: string;
    name: string;
    price: number;
    trend: 'up' | 'down' | 'stable';
}

export interface Listing {
    id: string;
    productName: string;
    quantity: string;
    price: number;
    description?: string;
    userId: string;
    timestamp: {
        toDate: () => Date;
    };
}

export interface UserSettings {
    farmName?: string;
    contactName?: string;
    phoneNumber?: string;
    notifyMarket?: boolean;
    notifyNews?: boolean;
    notifyPrice?: boolean;
}

export interface MembershipApplication {
    id: string;
    name: string;
    email: string;
    phone: string;
    farmLocation: string;
    farmSize: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
}