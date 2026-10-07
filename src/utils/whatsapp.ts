import { WHATSAPP_NUMBERS } from '../config'
import type { ConsultationItem } from '../types/product'
import { formatPrice } from './format'

const LAST_INDEX_KEY = 'myc-garage-whatsapp-last-index'

// Se invoca al abrir WhatsApp, nunca al renderizar el panel de consulta.
export function getNextWhatsAppNumber(): string {
  try {
    const saved = localStorage.getItem(LAST_INDEX_KEY)
    const parsed = saved !== null && saved.trim() !== '' ? Number(saved) : -1
    const lastIndex = Number.isInteger(parsed) && parsed >= 0 && parsed < WHATSAPP_NUMBERS.length ? parsed : -1
    const nextIndex = (lastIndex + 1) % WHATSAPP_NUMBERS.length
    localStorage.setItem(LAST_INDEX_KEY, String(nextIndex))
    return WHATSAPP_NUMBERS[nextIndex]
  } catch {
    return WHATSAPP_NUMBERS[0]
  }
}

export function createWhatsAppUrl(message: string, number: string = WHATSAPP_NUMBERS[0]): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function createConsultationMessage(items: ConsultationItem[]): string {
  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  return [
    'Hola, quería consultar por estos productos:',
    '',
    ...items.map(({ product, quantity }) => `- ${quantity} x ${product.name}${product.presentation ? ` — ${product.presentation}` : ''} — ${formatPrice(product.price * quantity)}`),
    '',
    `Total: ${formatPrice(total)}`,
  ].join('\n')
}
