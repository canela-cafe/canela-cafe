import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSiteContent } from '../context/SiteContentContext'

export default function B2B() {
  const ref = useScrollReveal<HTMLElement>()
  const { siteData } = useSiteContent()
  const { eyebrow, title, description, image, features } = siteData.b2b
  const { email_contato, telefone_whatsapp } = siteData.general

  return (
    <section className="section section--latte" id="b2b" ref={ref}>
      <div className="section__inner b2b__grid">
        <div className="b2b__text">
          <span className="eyebrow reveal">{eyebrow}</span>
          <h2 className="reveal reveal-delay-1">
            {title}
          </h2>
          <div className="divider reveal reveal-delay-2" />
          <p className="reveal reveal-delay-2" style={{ whiteSpace: 'pre-line' }}>
            {description}
          </p>

          <div className="b2b__features reveal reveal-delay-3">
            {features.map((feat) => (
              <div key={feat.title} className="b2b__feature">
                <div className="b2b__feature-icon">{feat.icon}</div>
                <div className="b2b__feature-title">{feat.title}</div>
                <div className="b2b__feature-desc">{feat.desc}</div>
              </div>
            ))}
          </div>

          <div className="reveal reveal-delay-4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href={`mailto:${email_contato}`}
              className="btn btn--primary"
            >
              ✉ Solicitar Proposta
            </a>
            <a
              href={`https://api.whatsapp.com/send?phone=${telefone_whatsapp}&text=Olá! Tenho interesse no atendimento B2B.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="b2b__visual reveal reveal-delay-2">
          <img src={image} alt="Curso de Barista - Canela Café" loading="lazy" />
        </div>
      </div>
    </section>
  )
}
