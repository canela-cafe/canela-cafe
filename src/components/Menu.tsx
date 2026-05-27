import { useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSiteContent, type Category } from '../context/SiteContentContext'

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'todos', label: 'Todos os Itens' },
  { key: 'marmitex', label: 'Marmitex (11h às 14h)' },
  { key: 'pratos', label: 'Pratos Executivos (11h às 14h)' },
  { key: 'hamburgers', label: 'Hamburgers' },
  { key: 'hotdogs', label: 'Hot Dogs' },
  { key: 'porcoes', label: 'Porções' },
  { key: 'milkshakes', label: 'Milk-shakes' },
  { key: 'bebidas', label: 'Bebidas' },
]

export default function Menu() {
  const [active, setActive] = useState<Category>('todos')
  const ref = useScrollReveal<HTMLElement>()
  const { menuItems, siteData } = useSiteContent()
  const { delivery_link } = siteData.general

  const filtered = active === 'todos'
    ? menuItems
    : menuItems.filter((item) => item.category.includes(active))

  return (
    <section className="section" id="cardapio" ref={ref}>
      <div className="section__inner">
        <div className="menu__header" style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
          <span className="eyebrow reveal">Nosso Cardápio Completo</span>
          <h2 className="reveal reveal-delay-1">
            Muito mais que café. A verdadeira gastronomia no seu dia.
          </h2>
          <div className="divider divider--center reveal reveal-delay-2" />
          <p className="reveal reveal-delay-2" style={{ margin: '0 auto', maxWidth: '700px' }}>
            Navegue por nossas opções de almoços executivos, lanches artesanais, porções para dividir e 
            nossos famosos milk-shakes.
          </p>
        </div>

        <div className="menu__categories reveal reveal-delay-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: 'var(--space-2xl)' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`menu__cat-btn ${active === cat.key ? 'menu__cat-btn--active' : ''}`}
              onClick={() => setActive(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="menu__grid">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id || item.title}
              className={`menu__card reveal reveal-delay-${Math.min((i % 4) + 1, 4)}`}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {item.tag && <span className="menu__card-tag">{item.tag}</span>}
              <motion.img
                src={item.image}
                alt={item.title}
                className="menu__card-img"
                loading="lazy"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              />
              <div className="menu__card-body" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px', flexDirection: 'column' }}>
                  <h4 className="menu__card-title" style={{ margin: 0 }}>{item.title}</h4>
                  <span style={{ fontWeight: 700, color: 'var(--cinnamon)', fontSize: '1.05rem', marginTop: '4px' }}>{item.price}</span>
                </div>
                {item.description && <p className="menu__card-desc">{item.description}</p>}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center reveal reveal-delay-4" style={{ marginTop: 'var(--space-3xl)' }}>
          <a
            href={delivery_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            style={{ fontSize: '1.1rem', padding: '16px 40px' }}
          >
            Acessar Delivery & Pedir Agora
          </a>
        </div>
      </div>
    </section>
  )
}
