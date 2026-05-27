import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSiteContent } from '../context/SiteContentContext'

export default function About() {
  const ref = useScrollReveal<HTMLElement>()
  const { siteData } = useSiteContent()
  const {
    eyebrow,
    title,
    paragraph_1,
    paragraph_2,
    stat1_val,
    stat1_lbl,
    stat2_val,
    stat2_lbl,
    stat3_val,
    stat3_lbl,
    image_1,
    image_2
  } = siteData.about

  return (
    <section className="section section--latte" id="sobre" ref={ref}>
      <div className="section__inner about__grid">
        <div className="about__text">
          <span className="eyebrow reveal">{eyebrow}</span>
          <h2 className="reveal reveal-delay-1">
            {title}
          </h2>
          <div className="divider reveal reveal-delay-2" />
          <p className="reveal reveal-delay-2" style={{ whiteSpace: 'pre-line' }}>
            {paragraph_1}
          </p>
          <p className="reveal reveal-delay-3" style={{ whiteSpace: 'pre-line' }}>
            {paragraph_2}
          </p>

          <div className="about__stats reveal reveal-delay-3">
            <div>
              <div className="about__stat-number">{stat1_val}</div>
              <div className="about__stat-label">{stat1_lbl}</div>
            </div>
            <div>
              <div className="about__stat-number">{stat2_val}</div>
              <div className="about__stat-label">{stat2_lbl}</div>
            </div>
            <div>
              <div className="about__stat-number">{stat3_val}</div>
              <div className="about__stat-label">{stat3_lbl}</div>
            </div>
          </div>
        </div>

        <div className="about__images reveal reveal-delay-2">
          <div className="about__img about__img--1">
            <img src={image_1} alt="Curso de Barista no Canela Café" loading="lazy" />
          </div>
          <div className="about__img about__img--2">
            <img src={image_2} alt="Café Gourmet Canela Café" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  )
}
