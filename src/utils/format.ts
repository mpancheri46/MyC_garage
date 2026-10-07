export const formatPrice = (price: number) => `$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(price)}`
