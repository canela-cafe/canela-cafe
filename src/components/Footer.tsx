import { Link } from 'react-router-dom'
import { IconInstagram, IconFacebook, IconWhatsapp } from '../icons'
import { useSiteContent } from '../context/SiteContentContext'

export default function Footer() {
  const year = new Date().getFullYear()
  const { siteData } = useSiteContent()
  const { 
    telefone_whatsapp, 
    email_contato, 
    endereco_rua, 
    horario_funcionamento, 
    delivery_link,
    instagram_link,
    facebook_link
  } = siteData.general

  const formatPhoneVisual = (num: string) => {
    if (num.length === 13) {
      return `(${num.substring(4, 6)}) ${num.substring(6, 11)}-${num.substring(11)}`
    }
    return num
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <img
                src={siteData.hero.logo_image}
                alt="Canela Café"
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--cream)',
              }}>
                {siteData.hero.title}
              </span>
            </div>
            <p>
              Dê uma pausa na sua rotina e venha tomar um cafezinho conosco.
              Cafés especiais, pratos artesanais e o melhor atendimento de Ribeirão Preto.
            </p>

            <div className="footer__socials">
              <a
                href={instagram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social"
                aria-label="Instagram"
              >
                <IconInstagram size={20} />
              </a>
              <a
                href={facebook_link}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social"
                aria-label="Facebook"
              >
                <IconFacebook size={20} />
              </a>
              <a
                href={`https://api.whatsapp.com/send?phone=${telefone_whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social"
                aria-label="WhatsApp"
              >
                <IconWhatsapp size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer__title">Navegação</h4>
            <div className="footer__links">
              <Link to="/assinatura" style={{ color: 'var(--cream)', fontWeight: 600 }}>Clube de Assinatura</Link>
              <Link to="/sobre">Sobre Nós</Link>
              <Link to="/cardapio">Cardápio</Link>
              <Link to="/loja">Loja</Link>
              <Link to="/b2b">Para Empresas</Link>
              <Link to="/contato">Contato</Link>
              <Link to="/admin" style={{ opacity: 0.5, fontSize: '0.8rem' }}>Painel Admin</Link>
            </div>
          </div>

          <div>
            <h4 className="footer__title">Contato</h4>
            <div className="footer__links">
              <a href={`https://api.whatsapp.com/send?phone=${telefone_whatsapp}`} target="_blank" rel="noopener noreferrer">
                {formatPhoneVisual(telefone_whatsapp)}
              </a>
              <a href={`mailto:${email_contato}`}>
                {email_contato}
              </a>
              <a href={delivery_link} target="_blank" rel="noopener noreferrer">
                Delivery (G3Food)
              </a>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h4 className="footer__title">Horário</h4>
              <div className="footer__links">
                <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>{horario_funcionamento}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} {siteData.hero.title} Empório e Cafeteria. Todos os direitos reservados.</span>
          <span style={{ whiteSpace: 'pre-line' }}>{endereco_rua}</span>
        </div>
      </div>
    </footer>
  )
}
