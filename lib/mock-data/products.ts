// Mock products data for MLAZ Business Intelligence Platform

export type ProductStatus = "Active" | "Inactive" | "Discontinued";
export type ProductCategory = "Pams" | "Sandals" | "Slippers" | "Shoes" | "Sneakers" | "Leather Footwear" | "Other";

export interface ProductVariant {
  id: string;
  color: string;
  size: string;  // EU size e.g. "EU 40"
  stock: number;
  reorderLevel: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description: string;
  material: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  status: ProductStatus;
  imageUrl?: string;
  variants: ProductVariant[];
  createdAt: string;
}

const SIZES = ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"];

export const products: Product[] = [
  {
    id: "P001",
    name: "Classic Pams",
    sku: "MLZ-CP-001",
    category: "Pams",
    description: "Premium hand-stitched pams in genuine leather, the bestselling style in our collection.",
    material: "Genuine Leather",
    brand: "MLAZ",
    costPrice: 8_000,
    sellingPrice: 12_000,
    reorderLevel: 5,
    status: "Active",
    createdAt: "2025-01-15",
    variants: [
      { id: "V001", color: "Black",  size: "EU 39", stock: 8,  reorderLevel: 5 },
      { id: "V002", color: "Black",  size: "EU 40", stock: 12, reorderLevel: 5 },
      { id: "V003", color: "Black",  size: "EU 41", stock: 10, reorderLevel: 5 },
      { id: "V004", color: "Black",  size: "EU 42", stock: 7,  reorderLevel: 5 },
      { id: "V005", color: "Black",  size: "EU 43", stock: 2,  reorderLevel: 5 },
      { id: "V006", color: "Black",  size: "EU 44", stock: 5,  reorderLevel: 5 },
      { id: "V007", color: "Brown",  size: "EU 40", stock: 9,  reorderLevel: 5 },
      { id: "V008", color: "Brown",  size: "EU 41", stock: 11, reorderLevel: 5 },
      { id: "V009", color: "Brown",  size: "EU 42", stock: 6,  reorderLevel: 5 },
      { id: "V010", color: "Brown",  size: "EU 43", stock: 4,  reorderLevel: 5 },
    ],
  },
  {
    id: "P002",
    name: "Leather Sandals",
    sku: "MLZ-LS-002",
    category: "Sandals",
    description: "Open-toe leather sandals with cushioned insoles and durable rubber soles.",
    material: "Genuine Leather / Rubber",
    brand: "MLAZ",
    costPrice: 10_300,
    sellingPrice: 15_500,
    reorderLevel: 5,
    status: "Active",
    createdAt: "2025-02-10",
    variants: [
      { id: "V011", color: "Brown",  size: "EU 37", stock: 6,  reorderLevel: 5 },
      { id: "V012", color: "Brown",  size: "EU 38", stock: 9,  reorderLevel: 5 },
      { id: "V013", color: "Brown",  size: "EU 39", stock: 1,  reorderLevel: 5 },
      { id: "V014", color: "Brown",  size: "EU 40", stock: 8,  reorderLevel: 5 },
      { id: "V015", color: "Tan",    size: "EU 37", stock: 7,  reorderLevel: 5 },
      { id: "V016", color: "Tan",    size: "EU 38", stock: 5,  reorderLevel: 5 },
      { id: "V017", color: "Tan",    size: "EU 39", stock: 10, reorderLevel: 5 },
      { id: "V018", color: "Cream",  size: "EU 36", stock: 4,  reorderLevel: 5 },
      { id: "V019", color: "Cream",  size: "EU 37", stock: 6,  reorderLevel: 5 },
    ],
  },
  {
    id: "P003",
    name: "Comfort Slippers",
    sku: "MLZ-CS-003",
    category: "Slippers",
    description: "Lightweight foam-cushioned house slippers for everyday comfort.",
    material: "EVA Foam / Fabric",
    brand: "MLAZ",
    costPrice: 3_500,
    sellingPrice: 7_000,
    reorderLevel: 8,
    status: "Active",
    createdAt: "2025-03-05",
    variants: [
      { id: "V020", color: "Black",  size: "EU 38", stock: 15, reorderLevel: 8 },
      { id: "V021", color: "Black",  size: "EU 39", stock: 18, reorderLevel: 8 },
      { id: "V022", color: "Black",  size: "EU 40", stock: 12, reorderLevel: 8 },
      { id: "V023", color: "Black",  size: "EU 41", stock: 9,  reorderLevel: 8 },
      { id: "V024", color: "Brown",  size: "EU 38", stock: 11, reorderLevel: 8 },
      { id: "V025", color: "Brown",  size: "EU 39", stock: 14, reorderLevel: 8 },
      { id: "V026", color: "Brown",  size: "EU 40", stock: 7,  reorderLevel: 8 },
    ],
  },
  {
    id: "P004",
    name: "Canvas Sneakers",
    sku: "MLZ-CN-004",
    category: "Sneakers",
    description: "Classic canvas sneakers with rubber vulcanized soles.",
    material: "Canvas / Rubber",
    brand: "MLAZ",
    costPrice: 12_000,
    sellingPrice: 18_000,
    reorderLevel: 5,
    status: "Active",
    createdAt: "2025-04-20",
    variants: [
      { id: "V027", color: "White",  size: "EU 40", stock: 8,  reorderLevel: 5 },
      { id: "V028", color: "White",  size: "EU 41", stock: 10, reorderLevel: 5 },
      { id: "V029", color: "White",  size: "EU 42", stock: 6,  reorderLevel: 5 },
      { id: "V030", color: "White",  size: "EU 43", stock: 4,  reorderLevel: 5 },
      { id: "V031", color: "Black",  size: "EU 40", stock: 7,  reorderLevel: 5 },
      { id: "V032", color: "Black",  size: "EU 41", stock: 9,  reorderLevel: 5 },
      { id: "V033", color: "Black",  size: "EU 42", stock: 5,  reorderLevel: 5 },
    ],
  },
  {
    id: "P005",
    name: "Oxford Shoes",
    sku: "MLZ-OX-005",
    category: "Shoes",
    description: "Formal oxford-style shoes with stitched soles, ideal for office and events.",
    material: "Full-grain Leather",
    brand: "MLAZ",
    costPrice: 21_000,
    sellingPrice: 32_000,
    reorderLevel: 3,
    status: "Active",
    createdAt: "2025-05-12",
    variants: [
      { id: "V034", color: "Black",  size: "EU 40", stock: 4,  reorderLevel: 3 },
      { id: "V035", color: "Black",  size: "EU 41", stock: 5,  reorderLevel: 3 },
      { id: "V036", color: "Black",  size: "EU 42", stock: 3,  reorderLevel: 3 },
      { id: "V037", color: "Black",  size: "EU 43", stock: 2,  reorderLevel: 3 },
      { id: "V038", color: "Brown",  size: "EU 40", stock: 3,  reorderLevel: 3 },
      { id: "V039", color: "Brown",  size: "EU 41", stock: 4,  reorderLevel: 3 },
      { id: "V040", color: "Brown",  size: "EU 42", stock: 3,  reorderLevel: 3 },
    ],
  },
  {
    id: "P006",
    name: "Sport Sandals",
    sku: "MLZ-SS-006",
    category: "Sandals",
    description: "Adjustable strap sport sandals with arch support for outdoor activities.",
    material: "Synthetic / Rubber",
    brand: "MLAZ",
    costPrice: 5_800,
    sellingPrice: 9_000,
    reorderLevel: 6,
    status: "Active",
    createdAt: "2025-06-01",
    variants: [
      { id: "V041", color: "Black",  size: "EU 38", stock: 10, reorderLevel: 6 },
      { id: "V042", color: "Black",  size: "EU 39", stock: 12, reorderLevel: 6 },
      { id: "V043", color: "Black",  size: "EU 40", stock: 8,  reorderLevel: 6 },
      { id: "V044", color: "Tan",    size: "EU 38", stock: 7,  reorderLevel: 6 },
      { id: "V045", color: "Tan",    size: "EU 39", stock: 9,  reorderLevel: 6 },
      { id: "V046", color: "Tan",    size: "EU 40", stock: 5,  reorderLevel: 6 },
    ],
  },
  {
    id: "P007",
    name: "Leather Moccasins",
    sku: "MLZ-LM-007",
    category: "Leather Footwear",
    description: "Handcrafted leather moccasins with soft suede lining.",
    material: "Suede Leather",
    brand: "MLAZ",
    costPrice: 17_000,
    sellingPrice: 26_000,
    reorderLevel: 3,
    status: "Active",
    createdAt: "2025-07-08",
    variants: [
      { id: "V047", color: "Brown",  size: "EU 40", stock: 3,  reorderLevel: 3 },
      { id: "V048", color: "Brown",  size: "EU 41", stock: 5,  reorderLevel: 3 },
      { id: "V049", color: "Tan",    size: "EU 40", stock: 2,  reorderLevel: 3 },
      { id: "V050", color: "Tan",    size: "EU 41", stock: 4,  reorderLevel: 3 },
    ],
  },
  {
    id: "P008",
    name: "Woven Slippers",
    sku: "MLZ-WS-008",
    category: "Slippers",
    description: "Braided fabric slippers with memory foam insole.",
    material: "Woven Fabric / Memory Foam",
    brand: "MLAZ",
    costPrice: 2_800,
    sellingPrice: 5_500,
    reorderLevel: 10,
    status: "Inactive",
    createdAt: "2025-08-01",
    variants: [
      { id: "V051", color: "Cream",  size: "EU 36", stock: 0,  reorderLevel: 10 },
      { id: "V052", color: "Cream",  size: "EU 37", stock: 0,  reorderLevel: 10 },
      { id: "V053", color: "Brown",  size: "EU 36", stock: 3,  reorderLevel: 10 },
    ],
  },
];

export const productCategories: ProductCategory[] = [
  "Pams", "Sandals", "Slippers", "Shoes", "Sneakers", "Leather Footwear", "Other",
];
