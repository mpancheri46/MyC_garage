import { mockProducts } from '../data/mockProducts'
import type { Product } from '../types/product'

// Cambiar a true para volver temporalmente a los datos de ejemplo.
export const USE_MOCK_DATA = false
// CSV publicado de la pestaña CATALOGO_WEB (gid=1933325673).
export const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRcdOQfz2wSZOuXYpChHspn9bUk0KZUXxM6MFWmkUrKMFrEkyLlKNf0Y-0HsPz1Qj6en0eeUorT0NuZ/pub?gid=1933325673&single=true&output=csv'

type Row = Record<string, string>

function parseCsv(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], cell = '', quoted = false
  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i]
    if (quoted) {
      if (char === '"' && csv[i + 1] === '"') { cell += '"'; i += 1 }
      else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"') quoted = true
    else if (char === ',') { row.push(cell); cell = '' }
    else if (char === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = '' }
    else cell += char
  }
  if (cell.length || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row) }
  return rows
}

function normalizeHeader(header: string): string {
  return header.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, '_')
}

function yes(value: string | undefined): boolean { return value?.trim().toUpperCase() === 'SI' }

function parsePrice(value: string | undefined): number {
  const normalized = (value ?? '').trim().replace(/^\$\s*/, '').replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')
  return normalized === '' ? NaN : Number(normalized)
}

function normalize(rows: string[][]): Product[] {
  const [header = [], ...body] = rows
  const columns = header.map(normalizeHeader)
  return body.map((values): Product | null => {
    const row: Row = Object.fromEntries(columns.map((key, index) => [key, values[index]?.trim() ?? '']))
    const price = parsePrice(row.PRECIO)
    const order = row.ORDEN?.trim() ? Number(row.ORDEN) : NaN
    const name = row.PRODUCTO?.trim() ?? ''
    const category = row.CATEGORIA?.trim() ?? ''
    if (!name || !category || !Number.isFinite(price) || !Number.isFinite(order)) return null
    return { id: row.ID?.trim() || `${category}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), category, name, presentation: row.PRESENTACION?.trim() ?? '', price, description: row.DESCRIPCION?.trim() ?? '', image: row.IMAGEN?.trim() ?? '', visible: yes(row.VISIBLE), featured: yes(row.DESTACADO), order }
  }).filter((product): product is Product => product !== null && product.visible).sort((a, b) => a.order - b.order)
}

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCK_DATA) return mockProducts.filter((product) => product.visible).sort((a, b) => a.order - b.order)
  if (!GOOGLE_SHEET_CSV_URL) throw new Error('Falta configurar la URL pública CSV de Google Sheets.')
  const response = await fetch(GOOGLE_SHEET_CSV_URL)
  if (!response.ok) throw new Error('No pudimos cargar el catálogo. Revisá la publicación de Google Sheets e intentá de nuevo.')
  const products = normalize(parseCsv(await response.text()))
  if (!products.length) throw new Error('No encontramos productos válidos y visibles en la pestaña CATALOGO_WEB.')
  return products
}
