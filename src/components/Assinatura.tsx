import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSiteContent } from '../context/SiteContentContext'

export default function Assinatura() {
  const ref = useScrollReveal<HTMLElement>()
  const { siteData } = useSiteContent()
  const {
    eyebrow,
    title,
    description,
    offer_eyebrow,
    offer_title,
    offer_desc,
    offer_btn_label,
    offer_image,
    steps
  } = siteData.assinatura
  const { telefone_whatsapp } = siteData.general

  return (
    <section className="section" id="assinatura" ref={ref}>
      <div className="section__inner">
        
        <div className="text-center" style={{ marginBottom: 'var(--space-3xl)' }}>
          <span className="eyebrow reveal">{eyebrow}</span>
          <h2 className="reveal reveal-delay-1">{title}</h2>
          <div className="divider divider--center reveal reveal-delay-2" />
          <p className="reveal reveal-delay-2" style={{ margin: '0 auto', maxWidth: '700px', whiteSpace: 'pre-line' }}>
            {description}
          </p>
        </div>

        <div className="assinatura__steps reveal reveal-delay-3" style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: 'var(--space-xl)',
          marginBottom: 'var(--space-4xl)'
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: 'var(--space-sm)',
                height: '80px',
                width: '80px',
                margin: '0 auto var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--warm-white)',
                borderRadius: '50%',
                border: '1px solid var(--border-light)'
              }}>
                {step.icon}
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px', color: 'var(--dark-roast)' }}>{step.title}</h4>
              <p style={{ fontSize: '0.85rem' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="assinatura__banner reveal reveal-delay-4" style={{
          background: 'var(--dark-roast)',
          borderRadius: '2px',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center'
        }}>
          <div style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
            <span className="eyebrow" style={{ color: 'var(--tan)' }}>{offer_eyebrow}</span>
            <h3 style={{ color: 'var(--cream)', fontSize: '2rem', marginBottom: 'var(--space-md)' }}>
              {offer_title}
            </h3>
            <p style={{ color: 'var(--tan)', marginBottom: 'var(--space-xl)' }}>
              {offer_desc}
            </p>
            <a 
              href={`https://api.whatsapp.com/send?phone=${telefone_whatsapp}&text=Olá! Quero saber mais sobre a Assinatura Canela Café.`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn--primary"
            >
              {offer_btn_label}
            </a>
          </div>
          <div style={{ height: '100%', minHeight: '300px' }}>
            <img src={offer_image} alt="Café Especial Canela" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

      </div>
    </section>
  )
}
