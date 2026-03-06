/**
 * Meta CAPI event name mapping. All standard events pass through; custom events use original name.
 * ALL event types are sent to Meta — no event-type restriction.
 */
const metaEventMap: Record<string, string> = {
  PageView: 'PageView',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'Purchase',
  Lead: 'Lead',
  CompleteRegistration: 'CompleteRegistration',
  Subscribe: 'Subscribe',
  Contact: 'Contact',
  Search: 'Search',
  CustomEvent: 'CustomEvent',
}

/**
 * Returns the Meta CAPI event name. Use mapped name or original if not in map.
 */
export function getMetaEventName(eventName: string): string {
  return metaEventMap[eventName] ?? eventName
}
