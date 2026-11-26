// Standard MLAZ Active Footwear Catalog & Product Categories

export const PRODUCT_CATEGORIES = [
  "Men",
  "Women",
  "Kids",
  "Unisex",
  "Sandals",
  "Slippers",
  "Pams",
  "Cover Shoes",
  "Accessories",
] as const;

export interface ActiveCatalogVariant {
  size: string;
  color: string;
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
}

export interface ActiveCatalogProduct {
  name: string;
  sku: string;
  category: string;
  brand: string;
  material: string;
  description: string;
  reorderLevel: number;
  status: "Active";
  variants: ActiveCatalogVariant[];
}

export const ACTIVE_PRODUCTS_CATALOG: ActiveCatalogProduct[] = [
  {
    name: "BATOZI PAMS",
    sku: "MLZ-BP-001",
    category: "Men",
    brand: "MLAZ",
    material: "Leather",
    description: "Batozi handcrafted pams footwear.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "41", color: "Black", price: 15000, costPrice: 0, stock: 1, sku: "MLZ-BP-001-41" },
      { size: "42", color: "Black", price: 15000, costPrice: 0, stock: 1, sku: "MLZ-BP-001-42" },
      { size: "43", color: "Brown", price: 15000, costPrice: 0, stock: 1, sku: "MLZ-BP-001-43" },
    ],
  },
  {
    name: "COVER SHOE",
    sku: "MLZ-CS-002",
    category: "Men",
    brand: "MLAZ",
    material: "Leather",
    description: "Classic closed cover shoe.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Black", price: 17000, costPrice: 0, stock: 1, sku: "MLZ-CS-002-STD" },
    ],
  },
  {
    name: "Children Shoes-FEMALE",
    sku: "MLZ-CSF-003",
    category: "Kids",
    brand: "MLAZ",
    material: "Synthetic / Leather",
    description: "Children footwear — Female design.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 5000, costPrice: 0, stock: 10, sku: "MLZ-CSF-003-STD" },
    ],
  },
  {
    name: "Children Shoes-Male",
    sku: "MLZ-CSM-004",
    category: "Kids",
    brand: "MLAZ",
    material: "Synthetic / Leather",
    description: "Children footwear — Male design.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 5000, costPrice: 0, stock: 4, sku: "MLZ-CSM-004-STD" },
    ],
  },
  {
    name: "FEMALE NORA HILL",
    sku: "MLZ-FNH-005",
    category: "Women",
    brand: "MLAZ",
    material: "Nora Sole / Leather",
    description: "Female Nora heel footwear.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 10000, costPrice: 0, stock: 3, sku: "MLZ-FNH-005-STD" },
    ],
  },
  {
    name: "Felame Flat Shoes-Foreign Sole (Sandal)",
    sku: "MLZ-FFS-006",
    category: "Women",
    brand: "MLAZ",
    material: "Foreign Sole",
    description: "Female flat shoes with foreign sole (sandal).",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 13500, costPrice: 0, stock: 0, sku: "MLZ-FFS-006-STD" },
    ],
  },
  {
    name: "Female Local flat Shoes",
    sku: "MLZ-FLF-007",
    category: "Women",
    brand: "MLAZ",
    material: "Local Sole",
    description: "Female flat shoes with local sole.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 5500, costPrice: 0, stock: 4, sku: "MLZ-FLF-007-STD" },
    ],
  },
  {
    name: "Female SHoes Flat Sole FR HILL",
    sku: "MLZ-FSFH-008",
    category: "Women",
    brand: "MLAZ",
    material: "Foreign Sole / Heel",
    description: "Female shoes flat sole foreign heel.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 10000, costPrice: 0, stock: 1, sku: "MLZ-FSFH-008-STD" },
    ],
  },
  {
    name: "Female SHoes Flat Sole( Nora)",
    sku: "MLZ-FSN-009",
    category: "Women",
    brand: "MLAZ",
    material: "Nora Sole",
    description: "Female flat sole shoes with Nora sole.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 8000, costPrice: 0, stock: 19, sku: "MLZ-FSN-009-STD" },
    ],
  },
  {
    name: "Female Shoes Flat Sole-FRN",
    sku: "MLZ-FSF-010",
    category: "Women",
    brand: "MLAZ",
    material: "Foreign Sole",
    description: "Female flat sole shoes with foreign sole.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 10000, costPrice: 0, stock: 46, sku: "MLZ-FSF-010-STD" },
    ],
  },
  {
    name: "Female half Cover",
    sku: "MLZ-FHC-011",
    category: "Women",
    brand: "MLAZ",
    material: "Leather",
    description: "Female half cover footwear.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 12000, costPrice: 0, stock: 2, sku: "MLZ-FHC-011-STD" },
    ],
  },
  {
    name: "H PEKKA",
    sku: "MLZ-HP-012",
    category: "Men",
    brand: "MLAZ",
    material: "Pekka Sole",
    description: "H Pekka sole slippers.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 13000, costPrice: 0, stock: 1, sku: "MLZ-HP-012-STD" },
    ],
  },
  {
    name: "MEN DOUBLE SOLE",
    sku: "MLZ-MDS-013",
    category: "Men",
    brand: "MLAZ",
    material: "Double Sole / Leather",
    description: "Men double sole footwear.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 20300, costPrice: 0, stock: 0, sku: "MLZ-MDS-013-STD" },
    ],
  },
  {
    name: "Male SHoes Flat Sole FRN",
    sku: "MLZ-MSF-014",
    category: "Men",
    brand: "MLAZ",
    material: "Foreign Sole",
    description: "Male flat sole shoes with foreign sole.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 13500, costPrice: 0, stock: 59, sku: "MLZ-MSF-014-STD" },
    ],
  },
  {
    name: "Male SHoes Flat Sole FRN 2 IN 1",
    sku: "MLZ-MSF2-015",
    category: "Men",
    brand: "MLAZ",
    material: "Foreign Sole",
    description: "Male flat sole 2-in-1 shoes with foreign sole.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 15000, costPrice: 0, stock: 12, sku: "MLZ-MSF2-015-STD" },
    ],
  },
  {
    name: "Male SHoes Flat Sole( Nora)",
    sku: "MLZ-MSN-016",
    category: "Men",
    brand: "MLAZ",
    material: "Nora Sole",
    description: "Male flat sole shoes with Nora sole.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 10000, costPrice: 0, stock: 3, sku: "MLZ-MSN-016-STD" },
    ],
  },
  {
    name: "Male SHoes Pekka Sole",
    sku: "MLZ-MSP-017",
    category: "Men",
    brand: "MLAZ",
    material: "Pekka Sole",
    description: "Male shoes with Pekka sole.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "Standard", color: "Default", price: 15000, costPrice: 0, stock: 10, sku: "MLZ-MSP-017-STD" },
    ],
  },
  {
    name: "V strap slide",
    sku: "MLZ-VSS-018",
    category: "Unisex",
    brand: "MLAZ",
    material: "Leather / Synthetic",
    description: "V strap slide footwear.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "40", color: "Black", price: 10000, costPrice: 0, stock: 1, sku: "MLZ-VSS-018-40" },
      { size: "41", color: "Black", price: 10000, costPrice: 0, stock: 1, sku: "MLZ-VSS-018-41" },
      { size: "42", color: "Brown", price: 10000, costPrice: 0, stock: 1, sku: "MLZ-VSS-018-42" },
      { size: "43", color: "Brown", price: 10000, costPrice: 0, stock: 0, sku: "MLZ-VSS-018-43" },
    ],
  },
  {
    name: "cover slippers",
    sku: "MLZ-CSL-019",
    category: "Unisex",
    brand: "MLAZ",
    material: "Leather",
    description: "Cover slippers footwear.",
    reorderLevel: 5,
    status: "Active",
    variants: [
      { size: "41", color: "Black", price: 10000, costPrice: 0, stock: 1, sku: "MLZ-CSL-019-41" },
      { size: "42", color: "Brown", price: 10000, costPrice: 0, stock: 0, sku: "MLZ-CSL-019-42" },
    ],
  },
];

export interface BulkProductCostInput {
  id: string;
  costPrice: number;
  price: number;
  wholesalePrice: number;
  wholesaleMinQty: number;
  category: string;
  sku: string;
  brand: string;
  material: string;
  reorderLevel: number;
  description: string;
  status: string;
}

