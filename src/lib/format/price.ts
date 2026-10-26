/**
 * Formats numeric prices according to Canva Lotus Pricelist standards:
 * - Uses Latin numerals for the price (e.g. "405 L.E", "620 L.E")
 * - If price is null, undefined, or 0, returns the Arabic fallback "السعر عند الطلب"
 */
export function formatMagazinePrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price <= 0 || isNaN(price)) {
    return 'السعر عند الطلب';
  }

  // Format with Latin digits and L.E
  return `${price} L.E`;
}
