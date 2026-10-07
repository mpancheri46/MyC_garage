import type { Product } from '../types/product'

export const mockProducts: Product[] = [
  { id: 'ceras-cherry-quick', category: 'CERAS LÍQUIDAS', name: 'CHERRY QUICK', presentation: '600ml + Gatillo', price: 7000, description: 'Cera rápida con acabado brillante y aroma frutal. Ideal para mantener la pintura protegida entre lavados.', image: '', visible: true, featured: true, order: 1 },
  { id: 'ceras-extreme-detail', category: 'CERAS LÍQUIDAS', name: 'EXTREME DETAIL', presentation: '600ml + Gatillo', price: 8500, description: 'Realza el brillo de la pintura y deja una terminación suave al tacto.', image: '', visible: true, featured: true, order: 2 },
  { id: 'shampoo-neutro', category: 'LAVADO', name: 'SHAMPOO NEUTRO', presentation: '1 litro', price: 6200, description: 'Limpieza efectiva para el lavado frecuente, cuidando las ceras y selladores aplicados.', image: '', visible: true, featured: false, order: 3 },
  { id: 'interior-cleaner', category: 'INTERIOR', name: 'INTERIOR CLEANER', presentation: '500ml + Gatillo', price: 5800, description: 'Limpia superficies interiores de manera práctica y deja un acabado natural.', image: '', visible: true, featured: true, order: 4 },
  { id: 'atomic', category: 'CERAS LÍQUIDAS', name: 'ATOMIC', presentation: '600ml + Pico', price: 7900, description: 'Protección y brillo para la pintura, en una aplicación simple.', image: '', visible: true, featured: false, order: 5 },
  { id: 'microfibra-premium', category: 'ACCESORIOS', name: 'MICROFIBRA PREMIUM', presentation: '40 × 40cm', price: 3500, description: 'Paño suave para retirar productos y cuidar las superficies del vehículo.', image: '', visible: true, featured: false, order: 6 },
  { id: 'limpia-llantas', category: 'LAVADO', name: 'LIMPIA LLANTAS', presentation: '500ml + Gatillo', price: 6800, description: '', image: '', visible: true, featured: false, order: 7 },
  { id: 'producto-oculto', category: 'OTROS', name: 'PRODUCTO OCULTO', presentation: '1 unidad', price: 1000, description: '', image: '', visible: false, featured: false, order: 99 },
]
