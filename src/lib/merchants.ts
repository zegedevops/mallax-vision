export type DemoMerchant = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  storeName: string;
  storeDomain: string;
  referenceImagePath: string;
  referenceImageUrl: string;
};

export const DEMO_REFERENCE_IMAGE_PATH = "public/demo/reference-face.jpg";
export const DEMO_REFERENCE_IMAGE_URL = "/demo/reference-face.jpg";

export const DEMO_MERCHANT: DemoMerchant = {
  id: "merch_northwind",
  email: "merchant@mallax.demo",
  password: "DemoPass123!",
  name: "Jordan Hale",
  role: "Store owner",
  storeName: "Northwind Apparel",
  storeDomain: "northwind-apparel.myshopify.com",
  referenceImagePath: DEMO_REFERENCE_IMAGE_PATH,
  referenceImageUrl: DEMO_REFERENCE_IMAGE_URL,
};

export const DEMO_CREDENTIALS = {
  email: DEMO_MERCHANT.email,
  password: DEMO_MERCHANT.password,
};

export function merchantMatchesPassword(
  merchant: DemoMerchant,
  email: string,
  password: string,
) {
  const normalized = email.trim().toLowerCase();
  return merchant.email === normalized && merchant.password === password;
}

export const DASHBOARD_STATS = [
  {
    label: "Returns this month",
    value: "148",
    hint: "Shopify return requests",
    change: "+12% vs last month",
  },
  {
    label: "Face-verified returns",
    value: "121",
    hint: "Identity confirmed at drop-off",
    change: "81.8% of returns",
  },
  {
    label: "Flagged for review",
    value: "9",
    hint: "Below match threshold",
    change: "Manual queue",
  },
  {
    label: "Avg. verification time",
    value: "42s",
    hint: "Capture to decision",
    change: "Stable week over week",
  },
] as const;

export const RECENT_RETURNS = [
  {
    id: "RET-18421",
    order: "#1042",
    item: "Merino crewneck",
    status: "Verified",
    score: "0.94",
  },
  {
    id: "RET-18418",
    order: "#1038",
    item: "Trail runner — slate",
    status: "Verified",
    score: "0.91",
  },
  {
    id: "RET-18411",
    order: "#1029",
    item: "Canvas tote",
    status: "Review",
    score: "0.61",
  },
  {
    id: "RET-18407",
    order: "#1024",
    item: "Wool overshirt",
    status: "Verified",
    score: "0.88",
  },
  {
    id: "RET-18399",
    order: "#1017",
    item: "Ribbed beanie",
    status: "Verified",
    score: "0.96",
  },
] as const;
