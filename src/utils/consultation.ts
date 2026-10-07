import type { ConsultationItem, Product } from '../types/product'

// Actualiza los datos guardados del producto sin cambiar las cantidades elegidas.
export function refreshConsultationProducts(items: ConsultationItem[], products: Product[]): ConsultationItem[] {
  const currentProducts = new Map(products.map((product) => [product.id, product]))
  return items.map((item) => {
    const product = currentProducts.get(item.product.id)
    return product ? { ...item, product } : item
  })
}
