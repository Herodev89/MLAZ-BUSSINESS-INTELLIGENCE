export interface HistoricalSaleSeedRow {
  id: string;
  customerName: string;
  productName: string;
  qty: number;
  amount: number;
  profit: number;
  date: string; // YYYY-MM-DD
}

export const HISTORICAL_SALES_2026: HistoricalSaleSeedRow[] = [
  // Page 1 (11 rows)
  { id: "TX-8A5C78CA", customerName: "Mrs. Stella Chinwe", productName: "Male SHoes Pekka Sole", qty: 4, amount: 45200, profit: 17200, date: "2026-11-15" },
  { id: "TX-AA198458", customerName: "Mrs. Stella Chinwe", productName: "MEN DOUBLE SOLE", qty: 2, amount: 31600, profit: 11600, date: "2026-11-15" },
  { id: "TX-9E9FB0A7", customerName: "Mrs. Stella Chinwe", productName: "Male SHoes Flat Sole FRN", qty: 2, amount: 19000, profit: 6000, date: "2026-11-15" },
  { id: "TX-76FFEF98", customerName: "Mrs. Stella Chinwe", productName: "Male SHoes Flat Sole FRN", qty: 2, amount: 22000, profit: 9000, date: "2026-11-15" },
  { id: "TX-E4FC5EDE", customerName: "Mrs. Stella Chinwe", productName: "Female Shoes Flat Sole-FRN", qty: 13, amount: 120400, profit: 42400, date: "2026-11-15" },
  { id: "TX-3F0E0A47", customerName: "Mrs. Stella Chinwe", productName: "Children Shoes-Male", qty: 2, amount: 7600, profit: 1600, date: "2026-11-15" },
  { id: "TX-2E18ED95", customerName: "Ms. Annabel Chinwe", productName: "MEN DOUBLE SOLE", qty: 1, amount: 18300, profit: 8300, date: "2026-11-01" },
  { id: "TX-0BB61C8B", customerName: "Felame Flat Shoes-Foreign Sole (Sandal)", productName: "Felame Flat Shoes-Foreign Sole (Sandal)", qty: 1, amount: 13500, profit: 6500, date: "2026-10-18" },
  { id: "TX-B9A580A0", customerName: "MUBARAK AMINU", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 13499, profit: 6999, date: "2026-10-01" },
  { id: "TX-79CBF578", customerName: "MUBARAK AMINU", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 13499, profit: 6999, date: "2026-10-01" },
  { id: "TX-DD463294", customerName: "MUBARAK AMINU", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 9999, profit: 3999, date: "2026-10-01" },

  // Page 2 (16 rows)
  { id: "TX-2FD435F3", customerName: "Ms. Rukayya ICAN", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 10000, profit: 4000, date: "2026-09-30" },
  { id: "TX-EA57E9CC", customerName: "PAUL STEPHEN", productName: "Female Shoes Flat Sole-FRN", qty: 2, amount: 14000, profit: 2000, date: "2026-09-26" },
  { id: "TX-82E5676E", customerName: "Mr. Jude", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 15000, profit: 8500, date: "2026-09-26" },
  { id: "TX-2C3EB81D", customerName: "ABDULLAHI MAIWADA", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 12000, profit: 5500, date: "2026-09-14" },
  { id: "TX-8670C283", customerName: "AHMADU ABDULLAHI KARIM", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 14000, profit: 7500, date: "2026-09-07" },
  { id: "TX-29F45D3B", customerName: "MUBARAK AMINU", productName: "Female Shoes Flat Sole-FRN", qty: 2, amount: 16000, profit: 4000, date: "2026-08-11" },
  { id: "TX-66A16D59", customerName: "MUBARAK AMINU", productName: "Male SHoes Pekka Sole", qty: 1, amount: 11000, profit: 4000, date: "2026-08-11" },
  { id: "TX-54A697B0", customerName: "ABDULLAHI ADAMU MUHAMMAD", productName: "Female Shoes Flat Sole-FRN", qty: 3, amount: 24000, profit: 6000, date: "2026-08-05" },
  { id: "TX-3B7EB057", customerName: "MUBARAK AMINU", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 7500, profit: 1500, date: "2026-08-05" },
  { id: "TX-863828AD", customerName: "KHALID AMINU", productName: "CHILDREN MOLES", qty: 1, amount: 5000, profit: 2500, date: "2026-08-02" },
  { id: "TX-6562E1E2", customerName: "KHALID AMINU", productName: "CHILDREN MOLES", qty: 1, amount: 5000, profit: 2500, date: "2026-08-02" },
  { id: "TX-37638E87", customerName: "KHALID AMINU", productName: "CHILDREN MOLES", qty: 1, amount: 5000, profit: 2500, date: "2026-08-02" },
  { id: "TX-9B60CD28", customerName: "KHALID AMINU", productName: "Children Shoes-Male", qty: 3, amount: 15000, profit: 6000, date: "2026-08-02" },
  { id: "TX-6626C521", customerName: "Customer 001", productName: "CUTTING SOLE SLIDE", qty: 1, amount: 7000, profit: 1500, date: "2026-07-30" },
  { id: "TX-B9C8F46A", customerName: "Walk-in Customer 3", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 7000, profit: 1000, date: "2026-07-30" },
  { id: "TX-6C5F36D6", customerName: "ADAMU ABDULLAHI MUHAMMAD", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 8000, profit: 1500, date: "2026-07-28" },

  // Page 3 (18 rows)
  { id: "TX-95CE37CF", customerName: "HABIBU TUKUR", productName: "Male SHoes Pekka Sole", qty: 1, amount: 9000, profit: 2000, date: "2026-07-27" },
  { id: "TX-618E669A", customerName: "HABIBU TUKUR", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 8000, profit: 1500, date: "2026-07-26" },
  { id: "TX-80D4D766", customerName: "HABIBU TUKUR", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 8000, profit: 1500, date: "2026-07-23" },
  { id: "TX-5C889BF0", customerName: "Walk-in Customer 2", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 7000, profit: 1000, date: "2026-07-20" },
  { id: "TX-397A79AE", customerName: "HARUNA ADAMU", productName: "Male SHoes Pekka Sole", qty: 1, amount: 9000, profit: 2000, date: "2026-07-15" },
  { id: "TX-83BE6D3C", customerName: "Walk-in Customer 1", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 8000, profit: 2000, date: "2026-07-15" },
  { id: "TX-D7AA6291", customerName: "ATINUKE FATIMA ADEBAYO", productName: "Female Shoes Flat Sole-FRN", qty: 5, amount: 32500, profit: 2500, date: "2026-07-14" },
  { id: "TX-290A6F37", customerName: "Costomer 2", productName: "Male SHoes Pekka Sole", qty: 1, amount: 9000, profit: 2000, date: "2026-07-12" },
  { id: "TX-37D7AB5C", customerName: "HARUNA RUKAYYAH IBRAHIM", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 10000, profit: 3500, date: "2026-07-09" },
  { id: "TX-45D78295", customerName: "HARUNA RUKAYYAH IBRAHIM", productName: "Female SHoes Flat Sole( Nora)", qty: 1, amount: 7000, profit: 500, date: "2026-07-09" },
  { id: "TX-2C16FF69", customerName: "IBRAHEEM HASSAN ANEKUNU", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 7000, profit: 500, date: "2026-06-22" },
  { id: "TX-265434E1", customerName: "CHIAMAKA EBIZIEM MERIT", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 9000, profit: 2500, date: "2026-06-04" },
  { id: "TX-2070D091", customerName: "ABDULGANIYU ABDULRASHEED OLAMI", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 9000, profit: 2500, date: "2026-05-29" },
  { id: "TX-84216296", customerName: "DANAZUMI KABIR ABUBAKAR", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 9000, profit: 2500, date: "2026-05-25" },
  { id: "TX-26BB3A8F", customerName: "MERIT CHIAMAKA EBIZIEM", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 10000, profit: 3500, date: "2026-05-25" },
  { id: "TX-D116AC43", customerName: "MERIT CHIAMAKA EBIZIEM", productName: "Male SHoes Flat Sole FRN", qty: 3, amount: 30000, profit: 10500, date: "2026-05-12" },
  { id: "TX-816DE704", customerName: "ABDULMAJID HASSAN MAHMUD", productName: "Male SHoes Flat Sole FRN", qty: 2, amount: 20000, profit: 7000, date: "2026-05-11" },
  { id: "TX-1E860116", customerName: "MERIT CHIAMAKA EBIZIEM", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 9500, profit: 3000, date: "2026-05-08" },

  // Page 4 (16 rows)
  { id: "TX-11F3C075", customerName: "CHIAMAKA EBIZIEM MERIT", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 7000, profit: 1000, date: "2026-05-06" },
  { id: "TX-29DCDEE0", customerName: "ADAMS ONIMISI MUSA", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 10000, profit: 3500, date: "2026-05-06" },
  { id: "TX-D0C966A9", customerName: "IJEOMA ANNABEL OZONGA", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 8000, profit: 2000, date: "2026-05-06" },
  { id: "TX-B2A579EF", customerName: "PAUL STEPHEN", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-05-04" },
  { id: "TX-EBE0A814", customerName: "USMAN ZAINAB BELLO", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 7000, profit: 1000, date: "2026-04-08" },
  { id: "TX-FF59E622", customerName: "BR CLOTHING ENTERPRISE", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 10000, profit: 3500, date: "2026-04-04" },
  { id: "TX-2CA8338A", customerName: "HASSAN SALIHU", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-04-03" },
  { id: "TX-9847A474", customerName: "SALIHU HASSAN", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-04-03" },
  { id: "TX-9F821A84", customerName: "BOLANLE LATEEFAT", productName: "Male SHoes Pekka Sole", qty: 1, amount: 11000, profit: 4000, date: "2026-03-29" },
  { id: "TX-E9F12185", customerName: "BOLANLE LATEEFAT", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 8000, profit: 1500, date: "2026-03-29" },
  { id: "TX-7C41BF6D", customerName: "RAULATU ADAMU TAHIR", productName: "Children Shoes-Male", qty: 1, amount: 5000, profit: 2000, date: "2026-03-23" },
  { id: "TX-08586B43", customerName: "RAULATU ADAMU TAHIR", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-03-21" },
  { id: "TX-08197D2B", customerName: "RAULATU ADAMU TAHIR", productName: "Children Shoes-Male", qty: 1, amount: 5000, profit: 2000, date: "2026-03-21" },
  { id: "TX-16BD7A11", customerName: "OLAIDE KHADIJAH", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 7000, profit: 1000, date: "2026-03-19" },
  { id: "TX-F1506300", customerName: "AUWAL HARUNA", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 10000, profit: 3500, date: "2026-03-18" },
  { id: "TX-EFFC3334", customerName: "SADIQ MAIDALA", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-03-17" },

  // Page 5 (15 rows)
  { id: "TX-4446C68B", customerName: "AISHA MUHAMMAD HASSAN", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 12000, profit: 5500, date: "2026-03-12" },
  { id: "TX-65BBAB1F", customerName: "ADAMS ONIMISI MUSA", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-03-05" },
  { id: "TX-3628D8F0", customerName: "AISHA MUHAMMAD HASSAN", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 12500, profit: 6000, date: "2026-03-05" },
  { id: "TX-ED2B782C", customerName: "MUHAMMED ABDULMALIK OWUDA", productName: "MEN DOUBLE SOLE", qty: 1, amount: 16000, profit: 6000, date: "2026-03-05" },
  { id: "TX-17D2F966", customerName: "ATTAHIRU KHADIJAT", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 7000, profit: 1000, date: "2026-03-04" },
  { id: "TX-DABE12E9", customerName: "AISHA MUHAMMAD HASSAN", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 2, amount: 24000, profit: 11000, date: "2026-03-04" },
  { id: "TX-E227E35F", customerName: "HABIBAT ODUNAYO ABDULALEEM", productName: "Male SHoes Pekka Sole", qty: 1, amount: 10000, profit: 3000, date: "2026-03-02" },
  { id: "TX-E7F734B0", customerName: "HABIBAT ODUNAYO ABDULALEEM", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-03-02" },
  { id: "TX-19E3CD45", customerName: "HARUNA DANJUMA YUNUSA", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 10000, profit: 3500, date: "2026-02-28" },
  { id: "TX-947E1697", customerName: "NASIR MAHMUD", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 12000, profit: 5500, date: "2026-02-24" },
  { id: "TX-821298D2", customerName: "NASIR MAHMUD", productName: "MEN DOUBLE SOLE", qty: 1, amount: 17000, profit: 7000, date: "2026-02-24" },
  { id: "TX-5A71B1E5", customerName: "HUMYSH STAR VENTURE INTEGRITY", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 10000, profit: 3500, date: "2026-02-23" },
  { id: "TX-901204AE", customerName: "PAUL STEPHEN", productName: "Female Shoes Flat Sole-FRN", qty: 2, amount: 14000, profit: 2000, date: "2026-02-16" },
  { id: "TX-EE214914", customerName: "HUMYSH STAR VENTURE INTEGRITY", productName: "Male SHoes Flat Sole FRN", qty: 2, amount: 21000, profit: 8000, date: "2026-02-16" },
  { id: "TX-851CF9CC", customerName: "SALIHU HASSAN", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 11000, profit: 4500, date: "2026-02-11" },

  // Page 6 (16 rows)
  { id: "TX-C2D24B6D", customerName: "PAUL STEPHEN", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 8000, profit: 1500, date: "2026-02-08" },
  { id: "TX-5F927486", customerName: "AMAKA MARY OKONKWO", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-02-07" },
  { id: "TX-D116195A", customerName: "TEMITOPE HAMIDAT AKINLAMI", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 7000, profit: 1000, date: "2026-02-07" },
  { id: "TX-BD8AA13F", customerName: "ADEBOLA ABOSEDE SOFOLUWE", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 8850, profit: 2350, date: "2026-02-03" },
  { id: "TX-967A0B4D", customerName: "ADAMS ONIMISI MUSA", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-02-02" },
  { id: "TX-151F685C", customerName: "Salihu Isa", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-02-01" },
  { id: "TX-9B00CA2E", customerName: "Zaieed A Zaieed", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-02-01" },
  { id: "TX-A0C7497E", customerName: "HAJARA ABDULLAHI", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 7000, profit: 1000, date: "2026-02-01" },
  { id: "TX-7F87A793", customerName: "ABOU-IHSAN AGRIBUSINESS ENTERPRISES", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 10000, profit: 3500, date: "2026-01-22" },
  { id: "TX-AEC51538", customerName: "Sa'ad Sani Bunza", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 10000, profit: 3500, date: "2026-01-18" },
  { id: "TX-8F9DB564", customerName: "Umar Ibrahim", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 9000, profit: 2500, date: "2026-01-18" },
  { id: "TX-94424476", customerName: "AISHA MUHAMMAD HASSAN", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 12000, profit: 5500, date: "2026-01-18" },
  { id: "TX-3A7B1EA0", customerName: "MUBARAK AMINU", productName: "Male SHoes Flat Sole FRN", qty: 1, amount: 10000, profit: 3500, date: "2026-01-16" },
  { id: "TX-8F1A19C8", customerName: "BIN KHATTAB ENTERPRISES", productName: "Male SHoes Flat Sole FRN 2 IN 1", qty: 1, amount: 11000, profit: 4500, date: "2026-01-13" },
  { id: "TX-0643B5E0", customerName: "ABAKADAYAWA GLOBAL ENTEPRISES", productName: "Female Shoes Flat Sole-FRN", qty: 1, amount: 10000, profit: 4000, date: "2026-01-12" },
  { id: "TX-84D9F934", customerName: "MUBARAK AMINU", productName: "Male SHoes Flat Sole FRN", qty: 2, amount: 20000, profit: 7000, date: "2026-01-05" },
];
