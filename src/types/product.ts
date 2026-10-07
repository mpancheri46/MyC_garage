export interface Product {
  id: string
  category: string
  name: string
  presentation: string
  price: number
  description: string
  image: string
  visible: boolean
  featured: boolean
  order: number
}

export interface ConsultationItem {
  product: Product
  quantity: number
}
