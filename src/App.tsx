import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'

import Home from './pages/Home'
import SobrePage from './pages/SobrePage'
import CardapioPage from './pages/CardapioPage'
import LojaPage from './pages/LojaPage'
import B2BPage from './pages/B2BPage'
import ContatoPage from './pages/ContatoPage'
import AssinaturaPage from './pages/AssinaturaPage'
import AdminPage from './pages/AdminPage'
import { SiteContentProvider } from './context/SiteContentContext'

function AppContent() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'

  return (
    <>
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={isAdmin ? {} : { paddingTop: 'var(--nav-height)' }}
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/assinatura" element={<AssinaturaPage />} />
            <Route path="/sobre" element={<SobrePage />} />
            <Route path="/cardapio" element={<CardapioPage />} />
            <Route path="/loja" element={<LojaPage />} />
            <Route path="/b2b" element={<B2BPage />} />
            <Route path="/contato" element={<ContatoPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppFloat />}
    </>
  )
}

export default function App() {
  return (
    <SiteContentProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </SiteContentProvider>
  )
}
