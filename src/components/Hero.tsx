import { motion } from 'framer-motion'
import { IconWhatsapp, IconMenu } from '../icons'
import { useSiteContent } from '../context/SiteContentContext'

export default function Hero() {
  const { siteData } = useSiteContent()
  const { title, subtitle, tagline, bg_image, logo_image, whatsapp_btn_label, menu_btn_label } = siteData.hero
  const { telefone_whatsapp, delivery_link } = siteData.general

  return (
    <section className="hero grain" id="inicio">
      <div className="hero__bg">
        <img src={bg_image} alt="Interior do Canela Café" />
      </div>

      <div className="hero__content">
        <img src={logo_image} alt="Canela Café Logo" className="hero__logo" />

        <h1 className="hero__title">
          {title}
          <em>{subtitle}</em>
        </h1>

        <p className="hero__tagline" style={{ whiteSpace: 'pre-line' }}>
          {tagline}
        </p>

        <div className="hero__actions">
          <motion.a
            href={`https://api.whatsapp.com/send?phone=${telefone_whatsapp}&text=Olá! Gostaria de fazer um pedido.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--whatsapp"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconWhatsapp size={20} /> {whatsapp_btn_label}
          </motion.a>
          <motion.a
            href={delivery_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--light"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconMenu size={20} /> {menu_btn_label}
          </motion.a>
        </div>
      </div>

      <div className="hero__scroll">
        <span>Explore</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  )
}
