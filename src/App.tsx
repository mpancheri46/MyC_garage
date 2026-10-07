import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, CircleHelp, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, SprayCan, Trash2, X } from 'lucide-react'
import { getProducts } from './services/products'
import { createConsultationMessage, createWhatsAppUrl, getNextWhatsAppNumber } from './utils/whatsapp'
import { refreshConsultationProducts } from './utils/consultation'
import type { ConsultationItem, Product } from './types/product'
import { formatPrice } from './utils/format'

const STORAGE_KEY = 'myc-garage-consultation'

function loadConsultation(): ConsultationItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ConsultationItem[] } catch { return [] }
}

function ProductVisual({ product, large = false }: { product: Product; large?: boolean }) {
  return <div className={`product-visual${large ? ' product-visual-large' : ''}`}>
    {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <div className="visual-placeholder" aria-label="Imagen próximamente">
      <span className="visual-orbit orbit-one" /><span className="visual-orbit orbit-two" />
      <span className="bottle"><span className="bottle-cap" /><span className="bottle-neck" /><span className="bottle-body"><span>MyC</span><i /></span></span>
      <span className="placeholder-caption">CUIDADO AUTOMOTOR</span>
    </div>}
  </div>
}

function ProductCard({ product, onSelect, onAdd, added }: { product: Product; onSelect: () => void; onAdd: () => void; added: boolean }) {
  return <article className="product-card">
    <button className="product-image-button" aria-label={`Ver ${product.name}`} onClick={onSelect}><ProductVisual product={product} />
      {product.featured && <span className="image-badge"><Sparkles size={12} /> Favorito</span>}
      <span className="image-open"><ArrowUpRight size={16} /></span>
    </button>
    <div className="product-copy">
      <span className="eyebrow product-category">{product.category}</span>
      <button className="product-name" onClick={onSelect}>{product.name}</button>
      <p className="product-presentation">{product.presentation}</p>
      <div className="product-bottom"><strong>{formatPrice(product.price)}</strong><button className={`add-button${added ? ' is-added' : ''}`} aria-label={`Agregar ${product.name} a la consulta`} onClick={onAdd}>{added ? <Check size={17} /> : <Plus size={17} />}<span>{added ? 'Agregado' : 'Agregar'}</span></button></div>
    </div>
  </article>
}

function ProductDialog({ product, onClose, onAdd, added }: { product: Product; onClose: () => void; onAdd: () => void; added: boolean }) {
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [onClose])
  return <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="product-dialog" role="dialog" aria-modal="true" aria-label={`Detalle de ${product.name}`}>
    <button className="icon-button dialog-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button><ProductVisual product={product} large />
    <div className="dialog-copy"><span className="eyebrow">{product.category}</span><h2>{product.name}</h2><p className="dialog-presentation">{product.presentation}</p>{product.description && <p className="dialog-description">{product.description}</p>}
      <div className="dialog-bottom"><strong>{formatPrice(product.price)}</strong><button className="primary-button" onClick={onAdd}>{added ? <Check size={17} /> : <Plus size={17} />}{added ? 'Agregado a la consulta' : 'Agregar a consulta'}</button></div>
    </div>
  </section></div>
}

function ConsultationDrawer({ items, onClose, onChange, onClear }: { items: ConsultationItem[]; onClose: () => void; onChange: (id: string, delta: number) => void; onClear: () => void }) {
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [onClose])
  const message = createConsultationMessage(items)
  const whatsappUrl = createWhatsAppUrl(message)
  return <div className="overlay drawer-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="consultation-drawer" role="dialog" aria-modal="true" aria-label="Tu consulta">
    <div className="drawer-header"><div><span className="eyebrow">MYC GARAGE</span><h2>Tu consulta <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></h2></div><button className="icon-button" onClick={onClose} aria-label="Cerrar consulta"><X size={20} /></button></div>
    {items.length === 0 ? <div className="consultation-empty"><span className="empty-icon"><ShoppingBag size={23} /></span><h3>Tu consulta está vacía</h3><p>Sumá los productos que te interesan y escribinos por WhatsApp.</p><button className="text-button" onClick={onClose}>Explorar catálogo <ArrowRight size={15} /></button></div> : <>
      <div className="consultation-list">{items.map(({ product, quantity }) => <div className="consultation-row" key={product.id}><ProductVisual product={product} /><div className="consultation-info"><span>{product.category}</span><strong>{product.name}</strong><small>{product.presentation}</small><b>{formatPrice(product.price)}</b><div className="quantity-control"><button onClick={() => onChange(product.id, -1)} aria-label={`Disminuir ${product.name}`}><Minus size={13} /></button><span>{quantity}</span><button onClick={() => onChange(product.id, 1)} aria-label={`Aumentar ${product.name}`}><Plus size={13} /></button></div></div><button className="remove-button" onClick={() => onChange(product.id, -quantity)} aria-label={`Eliminar ${product.name}`}><Trash2 size={16} /></button></div>)}</div>
      <div className="drawer-footer"><button className="clear-button" onClick={onClear}>Vaciar consulta</button><a className="whatsapp-button" href={whatsappUrl} onClick={(event) => { event.currentTarget.href = createWhatsAppUrl(message, getNextWhatsAppNumber()) }} target="_blank" rel="noreferrer">Consultar por WhatsApp <ArrowUpRight size={17} /></a><p>La consulta no implica una compra.</p></div>
    </>}
  </aside></div>
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [consultation, setConsultation] = useState<ConsultationItem[]>(loadConsultation)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const currentProducts = await getProducts()
      setProducts(currentProducts)
      setConsultation((current) => refreshConsultationProducts(current, currentProducts))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos cargar el catálogo. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void loadProducts() }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(consultation)) }, [consultation])

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(products.map((product) => product.category))).sort((a, b) => a.localeCompare(b, 'es'))], [products])
  const normalizedQuery = query.trim().toLocaleLowerCase('es')
  const filtered = useMemo(() => products.filter((product) => (activeCategory === 'Todos' || product.category === activeCategory) && (!normalizedQuery || [product.name, product.category, product.presentation].some((field) => field.toLocaleLowerCase('es').includes(normalizedQuery)))), [products, activeCategory, normalizedQuery])
  const featured = products.filter((product) => product.featured)
  const selectedIds = new Set(consultation.map((item) => item.product.id))
  const itemCount = consultation.reduce((sum, item) => sum + item.quantity, 0)

  const addProduct = (product: Product) => setConsultation((current) => { const found = current.find((item) => item.product.id === product.id); return found ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { product, quantity: 1 }] })
  const changeQuantity = (id: string, delta: number) => setConsultation((current) => current.map((item) => item.product.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0))
  const goToCatalog = () => { document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false) }

  return <div className="site-shell">
    <div className="top-note"><span>Productos para cuidar cada detalle.</span><span className="top-note-dot" /><span>Atención directa por WhatsApp</span><ArrowUpRight size={12} /></div>
    <header className="site-header"><a className="brand header-brand" href="#inicio" aria-label="MyC Garage, inicio"><img className="header-logo" src="/images/myc-garage-logo.png" alt="MyC Garage" width="1600" height="592" /></a>
      <nav className={`main-nav${mobileMenuOpen ? ' nav-open' : ''}`}><a href="#productos" onClick={() => setMobileMenuOpen(false)}>Productos</a><a href="#categorias" onClick={() => setMobileMenuOpen(false)}>Categorías</a><a href="#nosotros" onClick={() => setMobileMenuOpen(false)}>Nosotros</a></nav>
      <div className="header-actions"><button className="consultation-trigger" onClick={() => setDrawerOpen(true)}><ShoppingBag size={17} /><span>Mi consulta</span><b>{itemCount}</b></button><button className="mobile-menu-button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Abrir menú">{mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    </header>

    <main id="inicio"><section className="hero"><div className="hero-text"><div className="hero-kicker"><span /> DETAILING & CAR CARE <span>·</span> ARGENTINA</div><h1>El cuidado de tu auto,<br /><em>en buenas manos.</em></h1><p>Encontrá los productos que necesitás para que cada detalle vuelva a brillar.</p><button className="hero-button" onClick={goToCatalog}>Explorar productos <ArrowDown size={16} /></button><div className="hero-footnote"><span className="mini-stars">✳ ✳ ✳</span> Selección para los que disfrutan cuidar su auto</div></div>
      <div className="hero-art" aria-hidden="true"><span className="hero-art-label">MYC GARAGE / CAR CARE</span><strong>CADA DETALLE<br />CUENTA.</strong><div className="hero-art-caption"><span>DETAILING</span><span>EL CUIDADO SE NOTA</span></div></div>
    </section>

    {!loading && !error && featured.length > 0 && <section className="featured-section content-section"><div className="section-heading"><div><span className="eyebrow">UNA BUENA ELECCIÓN</span><h2>Los que más brillan<span>.</span></h2></div><button className="section-link" onClick={goToCatalog}>Ver catálogo completo <ArrowRight size={15} /></button></div><div className="featured-grid">{featured.slice(0, 3).map((product, index) => <button className={`featured-tile featured-tile-${index + 1}`} key={product.id} onClick={() => setSelectedProduct(product)}><ProductVisual product={product} /><div className="featured-tile-meta"><span>{product.category}</span><b>{product.name}</b></div><span className="featured-arrow"><ArrowUpRight size={18} /></span></button>)}</div></section>}

    <section className="category-section content-section" id="categorias"><div className="section-heading category-heading"><div><span className="eyebrow">ENCONTRÁ LO QUE BUSCÁS</span><h2>Por categoría<span>.</span></h2></div><p>Lo esencial para cada parte de tu auto.</p></div><div className="category-row">{categories.filter((category) => category !== 'Todos').map((category, index) => <button key={category} className={`category-chip${activeCategory === category ? ' category-chip-active' : ''}`} onClick={() => { setActiveCategory(category); goToCatalog() }}><span className="category-number">0{index + 1}</span><span>{category}</span><ArrowUpRight size={15} /></button>)}</div></section>

    <section className="catalog-section content-section" id="productos"><div className="section-heading catalog-heading"><div><span className="eyebrow">CATÁLOGO MYC</span><h2>Todo para tu garage<span>.</span></h2></div><div className="catalog-count">{loading ? 'Cargando…' : `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}`}</div></div>
      <div className="catalog-controls"><div className="category-tabs">{categories.map((category) => <button key={category} className={category === activeCategory ? 'tab-active' : ''} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto..." aria-label="Buscar productos" />{query && <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X size={14} /></button>}</label></div>
      {loading ? <div className="catalog-message"><span className="loader" /><p>Preparando el catálogo...</p></div> : error ? <div className="catalog-message error-message"><span className="error-icon"><CircleHelp size={20} /></span><h3>No pudimos cargar los productos</h3><p>{error}</p><button className="outline-button" onClick={() => void loadProducts()}>Intentar de nuevo <ChevronRight size={15} /></button></div> : filtered.length === 0 ? <div className="catalog-message"><span className="error-icon"><Search size={19} /></span><h3>No encontramos productos</h3><p>Probá con otra búsqueda o categoría.</p><button className="text-button" onClick={() => { setQuery(''); setActiveCategory('Todos') }}>Limpiar filtros</button></div> : <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onSelect={() => setSelectedProduct(product)} onAdd={() => addProduct(product)} added={selectedIds.has(product.id)} />)}</div>}
    </section>

    <section className="contact-strip" id="nosotros"><span className="contact-mark"><SprayCan size={23} /></span><div><span className="eyebrow">MYC GARAGE · CAR CARE</span><h2>Tu próximo detalle empieza acá.</h2></div><p>¿Tenés dudas? Armá tu consulta y te ayudamos a elegir.</p><button onClick={() => setDrawerOpen(true)}>Hablemos <ArrowRight size={16} /></button></section>
    </main>

    <footer className="site-footer"><a className="brand footer-brand" href="#inicio"><span className="brand-name">MyC <b>GARAGE</b></span></a><span className="footer-tagline">Cuidado que se nota.</span><span className="footer-copy">© {new Date().getFullYear()} MyC Garage</span><a className="back-top" href="#inicio">Volver arriba <ChevronLeft size={14} className="back-top-icon" /></a></footer>

    {selectedProduct && <ProductDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={() => addProduct(selectedProduct)} added={selectedIds.has(selectedProduct.id)} />}
    {drawerOpen && <ConsultationDrawer items={consultation} onClose={() => setDrawerOpen(false)} onChange={changeQuantity} onClear={() => setConsultation([])} />}
    <button className={`floating-consultation${itemCount ? ' has-items' : ''}`} onClick={() => setDrawerOpen(true)} aria-label={`Abrir consulta, ${itemCount} productos`}><ShoppingBag size={18} /><span>Consulta</span>{itemCount > 0 && <b>{itemCount}</b>}</button>
  </div>
}
