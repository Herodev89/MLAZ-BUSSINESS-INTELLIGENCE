// Mock customers data

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: string;
  createdAt: string;
}

export const customers: Customer[] = [
  { id: "C001", name: "Emeka Obi",       phone: "0801 234 5678", email: "emeka.obi@gmail.com",    address: "14 Aba Road, Portharcourt",   totalPurchases: 18, totalSpent: 324_000, lastPurchase: "2026-08-12", createdAt: "2025-01-10" },
  { id: "C002", name: "Fatima Aliyu",    phone: "0802 345 6789", email: "fatima.aliyu@yahoo.com",  address: "7 Kingsway, Abuja",           totalPurchases: 12, totalSpent: 198_000, lastPurchase: "2026-08-12", createdAt: "2025-02-14" },
  { id: "C003", name: "Chidi Nwosu",     phone: "0803 456 7890", email: "chidi.nwosu@outlook.com", address: "22 Broad St, Lagos Island",   totalPurchases: 24, totalSpent: 512_000, lastPurchase: "2026-08-11", createdAt: "2025-01-20" },
  { id: "C004", name: "Amara Eze",       phone: "0804 567 8901", email: undefined,                 address: "3 Market Road, Enugu",        totalPurchases: 9,  totalSpent: 98_000,  lastPurchase: "2026-08-11", createdAt: "2025-03-05" },
  { id: "C005", name: "Biodun Adeyemi",  phone: "0805 678 9012", email: "biodun.a@gmail.com",      address: "45 Allen Ave, Ikeja Lagos",   totalPurchases: 31, totalSpent: 748_000, lastPurchase: "2026-08-10", createdAt: "2025-01-05" },
  { id: "C006", name: "Ngozi Okonkwo",   phone: "0806 789 0123", email: "ngozi.ok@gmail.com",      address: "11 Owerri Road, Aba",         totalPurchases: 15, totalSpent: 215_000, lastPurchase: "2026-08-10", createdAt: "2025-04-12" },
  { id: "C007", name: "Tunde Bello",     phone: "0807 890 1234", email: undefined,                 address: undefined,                     totalPurchases: 6,  totalSpent: 72_000,  lastPurchase: "2026-08-09", createdAt: "2025-06-01" },
  { id: "C008", name: "Aisha Mohammed",  phone: "0808 901 2345", email: "aisha.moh@gmail.com",     address: "29 Sultan Rd, Kaduna",        totalPurchases: 21, totalSpent: 394_000, lastPurchase: "2026-08-09", createdAt: "2025-02-28" },
  { id: "C009", name: "Kelechi Okafor",  phone: "0809 012 3456", email: "kelechi.ok@yahoo.com",    address: "8 Trans-Amadi, Portharcourt", totalPurchases: 27, totalSpent: 621_000, lastPurchase: "2026-08-08", createdAt: "2025-01-18" },
  { id: "C010", name: "Sade Adewale",    phone: "0810 123 4567", email: "sade.adewale@gmail.com",  address: "16 Agodi GRA, Ibadan",        totalPurchases: 11, totalSpent: 176_000, lastPurchase: "2026-08-08", createdAt: "2025-05-10" },
  { id: "C011", name: "Uche Obi",        phone: "0811 234 5678", email: undefined,                 address: "2 Fegge, Onitsha",            totalPurchases: 4,  totalSpent: 48_000,  lastPurchase: "2026-08-07", createdAt: "2025-07-14" },
  { id: "C012", name: "Hauwa Abdullahi", phone: "0812 345 6789", email: "hauwa.ab@gmail.com",      address: "33 Baga Road, Maiduguri",     totalPurchases: 8,  totalSpent: 124_000, lastPurchase: "2026-08-06", createdAt: "2025-06-20" },
];
