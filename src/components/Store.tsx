import { useScrollReveal } from '../hooks/useScrollReveal'
import { motion } from 'framer-motion'
import { useSiteContent } from '../context/SiteContentContext'

export default function Store() {
  const ref = useScrollReveal<HTMLElement>()
  const { storeItems, siteData } = useSiteContent()
  const { telefone_whatsapp } = siteData.general

  return (
    <section className="section section--dark grain" id="loja" ref={ref}>
      <div className="section__inner">
        <div className="store__header">
          <span className="eyebrow reveal">Nossa Loja</span>
          <h2 className="reveal reveal-delay-1">
            Leve o Canela Café para casa
          </h2>
          <div className="divider divider--center divider--light reveal reveal-delay-2" />
          <p className="reveal reveal-delay-2">
            Cafés especiais em grãos e moídos, acessórios para preparo e kits exclusivos.
            Em breve, compre direto pelo site!
          </p>
        </div>

        <div className="store__grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 340px))', justifyContent: 'center' }}>
          {storeItems.map((product, i) => (
            <motion.div
              key={product.id || product.title}
              className={`store__card reveal reveal-delay-${(i % 3) + 1}`}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.img
                src={product.image}
                alt={product.title}
                className="store__card-img"
                loading="lazy"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              />
              <div className="store__card-body">
                {product.badge && (
                  <span className="store__card-badge">{product.badge}</span>
                )}
                <h4 className="store__card-title">{product.title}</h4>
                {product.description && (
                  <p className="menu__card-desc" style={{ color: 'rgba(196,180,154,0.7)', fontSize: '0.8rem', marginBottom: '8px' }}>
                    {product.description}
                  </p>
                )}
                <div className="store__card-price">
                  {product.price}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: '6px', opacity: 0.6 }}>
                    / {product.weight}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="store__cta reveal">
          <a
            href={`https://api.whatsapp.com/send?phone=${telefone_whatsapp}&text=Olá! Gostaria de comprar café especial.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--light"
          >
            Encomendar via WhatsApp →
          </a>
          <p style={{ color: 'var(--tan)', opacity: 0.5, fontSize: '0.8rem', marginTop: '12px' }}>
            Loja virtual em breve • Entrega grátis até 3km
          </p>
        </div>
      </div>
    </section>
  )
}
