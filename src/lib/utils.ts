
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DeliveryZone } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const SHIPPING_RATES = {
  'inside-rangpur-city': {
    'inside-rangpur-city': 40,
    'rangpur-division': 80,
    'outside-rangpur': 130,
  },
  'rangpur-division': {
    'inside-rangpur-city': 80,
    'rangpur-division': 70,
    'outside-rangpur': 150,
  },
  'outside-rangpur': {
    'inside-rangpur-city': 130,
    'rangpur-division': 150,
    'outside-rangpur': 180,
  },
};


export function calculateShippingCost(sellerZone: DeliveryZone, buyerZone: DeliveryZone): number {
  return SHIPPING_RATES[sellerZone]?.[buyerZone] ?? 150; // Return a default value if zones are not found
}
