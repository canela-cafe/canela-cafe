import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useSiteContent, type MenuItem, type StoreItem, type Category, type SiteContent } from '../context/SiteContentContext'

export default function AdminPage() {
  const { siteData, menuItems, storeItems, updateSection, refreshData } = useSiteContent()

  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [session, setSession] = useState<any>(null)
  const [isDemoLoggedIn, setIsDemoLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('canela_admin_demo_session') === 'true'
  })
  const [email, setEmail] = useState<string>('2026.canela.cafe@gmail.com')
  const [password, setPassword] = useState<string>('')
  const [authError, setAuthError] = useState<string>('')
  const [authLoading, setAuthLoading] = useState<boolean>(false)

  // --- ESTADOS DO DASHBOARD ---
  const [activeTab, setActiveTab] = useState<'cardapio' | 'loja' | 'paginas' | 'contatos'>('cardapio')
  const [loading, setLoading] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: 'idle' | 'saving' | 'success' | 'error' }>({})

  // --- ESTADOS DE PRODUTOS DO CARDÁPIO (CRUD) ---
  const [editingMenuProduct, setEditingMenuProduct] = useState<Partial<MenuItem> | null>(null)
  const [isAddingMenuProduct, setIsAddingMenuProduct] = useState<boolean>(false)
  const [menuForm, setMenuForm] = useState<{
    title: string
    price: string
    description: string
    category: Category
    tag: string
    image: string
  }>({
    title: '',
    price: '',
    description: '',
    category: 'hamburgers',
    tag: '',
    image: ''
  })
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)

  // --- ESTADOS DE PRODUTOS DA LOJA (CRUD) ---
  const [editingStoreProduct, setEditingStoreProduct] = useState<Partial<StoreItem> | null>(null)
  const [isAddingStoreProduct, setIsAddingStoreProduct] = useState<boolean>(false)
  const [storeForm, setStoreForm] = useState<{
    title: string
    price: string
    weight: string
    description: string
    badge: string
    image: string
  }>({
    title: '',
    price: '',
    weight: '',
    description: '',
    badge: '',
    image: ''
  })

  // --- ESTADOS DOS FORMULÁRIOS DE TEXTOS ---
  const [heroForm, setHeroForm] = useState({ ...siteData.hero })
  const [aboutForm, setAboutForm] = useState({ ...siteData.about })
  const [assinaturaForm, setAssinaturaForm] = useState({ ...siteData.assinatura })
  const [b2bForm, setB2bForm] = useState({ ...siteData.b2b })

  // --- ESTADOS DO FORMULÁRIO DE CONTATOS ---
  const [contactForm, setContactForm] = useState({ ...siteData.general })

  // --- ESCUTADORES DE AUTENTICAÇÃO ---
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  // Sincroniza formulários quando os dados do contexto são carregados
  useEffect(() => {
    setHeroForm({ ...siteData.hero })
    setAboutForm({ ...siteData.about })
    setAssinaturaForm({ ...siteData.assinatura })
    setB2bForm({ ...siteData.b2b })
    setContactForm({ ...siteData.general })
  }, [siteData])

  // --- AÇÕES DE AUTENTICAÇÃO ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    if (!isSupabaseConfigured) {
      // Modo de demonstração local
      if (email === '2026.canela.cafe@gmail.com' && password === 'canela2026') {
        setIsDemoLoggedIn(true)
        sessionStorage.setItem('canela_admin_demo_session', 'true')
      } else {
        setAuthError('Usuário ou senha incorretos para o modo offline (Dica: use email "2026.canela.cafe@gmail.com" e senha "canela2026").')
      }
      setAuthLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) {
        setAuthError(error.message === 'Invalid login credentials' ? 'Usuário ou senha incorretos no Supabase.' : error.message)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro inesperado ao autenticar.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!isSupabaseConfigured) {
      setIsDemoLoggedIn(false)
      sessionStorage.removeItem('canela_admin_demo_session')
      return
    }
    await supabase.auth.signOut()
  }

  // --- INTERMEDIÁRIO DE UPLOAD DE IMAGEM ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'menu' | 'store' | 'hero' | 'about1' | 'about2') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      let finalUrl = ''

      if (!isSupabaseConfigured) {
        // No modo Demo, criamos um Object URL local
        finalUrl = URL.createObjectURL(file)
      } else {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('canela-cafe')
          .upload(filePath, file)

        if (uploadError) {
          throw uploadError
        }

        const { data } = supabase.storage
          .from('canela-cafe')
          .getPublicUrl(filePath)

        finalUrl = data.publicUrl
      }

      if (target === 'menu') {
        setMenuForm(prev => ({ ...prev, image: finalUrl }))
        if (editingMenuProduct) {
          setEditingMenuProduct(prev => prev ? { ...prev, image: finalUrl } : null)
        }
      } else if (target === 'store') {
        setStoreForm(prev => ({ ...prev, image: finalUrl }))
        if (editingStoreProduct) {
          setEditingStoreProduct(prev => prev ? { ...prev, image: finalUrl } : null)
        }
      } else if (target === 'hero') {
        setHeroForm(prev => ({ ...prev, bg_image: finalUrl }))
      } else if (target === 'about1') {
        setAboutForm(prev => ({ ...prev, image_1: finalUrl }))
      } else if (target === 'about2') {
        setAboutForm(prev => ({ ...prev, image_2: finalUrl }))
      }

    } catch (err: any) {
      console.error(err)
      alert(`Falha no upload da imagem: ${err.message || 'Verifique se você criou o Bucket público chamado "canela-cafe" no Storage do Supabase.'}`)
    } finally {
      setUploadingImage(false)
    }
  }

  // --- AÇÕES CRUD: CARDÁPIO (MENU) ---
  const saveMenuProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const isEdit = !!editingMenuProduct?.id
    const payload = {
      title: isEdit ? editingMenuProduct!.title! : menuForm.title,
      price: isEdit ? editingMenuProduct!.price! : menuForm.price,
      description: isEdit ? editingMenuProduct!.description! : menuForm.description,
      category: isEdit ? editingMenuProduct!.category! : [menuForm.category],
      tag: isEdit ? editingMenuProduct!.tag! : menuForm.tag || null,
      image_url: isEdit ? editingMenuProduct!.image! : menuForm.image
    }

    if (!isSupabaseConfigured) {
      // Offline/Demo
      alert('Produto cadastrado localmente no modo demonstração!')
      setIsAddingMenuProduct(false)
      setEditingMenuProduct(null)
      setLoading(false)
      return
    }

    try {
      let error
      if (isEdit) {
        const { error: err } = await supabase
          .from('produtos')
          .update(payload)
          .eq('id', editingMenuProduct!.id)
        error = err
      } else {
        const { error: err } = await supabase
          .from('produtos')
          .insert([payload])
        error = err
      }

      if (error) throw error

      setIsAddingMenuProduct(false)
      setEditingMenuProduct(null)
      setMenuForm({
        title: '',
        price: '',
        description: '',
        category: 'hamburgers',
        tag: '',
        image: ''
      })
      await refreshData()
    } catch (err: any) {
      alert(`Erro ao salvar produto: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteMenuProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este item do cardápio?')) return

    if (!isSupabaseConfigured) {
      alert('Removido localmente no modo de demonstração!')
      return
    }

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id)

      if (error) throw error
      await refreshData()
    } catch (err: any) {
      alert(`Erro ao excluir produto: ${err.message}`)
    }
  }

  // --- AÇÕES CRUD: LOJA (STORE) ---
  const saveStoreProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const isEdit = !!editingStoreProduct?.id
    const payload = {
      title: isEdit ? editingStoreProduct!.title! : storeForm.title,
      price: isEdit ? editingStoreProduct!.price! : storeForm.price,
      weight: isEdit ? editingStoreProduct!.weight! : storeForm.weight,
      description: isEdit ? editingStoreProduct!.description! : storeForm.description,
      badge: isEdit ? editingStoreProduct!.badge! : storeForm.badge || null,
      image_url: isEdit ? editingStoreProduct!.image! : storeForm.image
    }

    if (!isSupabaseConfigured) {
      alert('Produto de loja cadastrado localmente no modo demo!')
      setIsAddingStoreProduct(false)
      setEditingStoreProduct(null)
      setLoading(false)
      return
    }

    try {
      let error
      if (isEdit) {
        const { error: err } = await supabase
          .from('produtos_loja')
          .update(payload)
          .eq('id', editingStoreProduct!.id)
        error = err
      } else {
        const { error: err } = await supabase
          .from('produtos_loja')
          .insert([payload])
        error = err
      }

      if (error) throw error

      setIsAddingStoreProduct(false)
      setEditingStoreProduct(null)
      setStoreForm({
        title: '',
        price: '',
        weight: '',
        description: '',
        badge: '',
        image: ''
      })
      await refreshData()
    } catch (err: any) {
      alert(`Erro ao salvar produto de loja: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteStoreProduct = async (id: string) => {
    if (!window.confirm('Deseja excluir este item da vitrine?')) return

    if (!isSupabaseConfigured) {
      alert('Removido no modo de demonstração!')
      return
    }

    try {
      const { error } = await supabase
        .from('produtos_loja')
        .delete()
        .eq('id', id)

      if (error) throw error
      await refreshData()
    } catch (err: any) {
      alert(`Erro ao excluir item: ${err.message}`)
    }
  }

  // --- AÇÃO: SALVAR SEÇÕES DE TEXTO E IMAGENS ---
  const saveTextSection = async (sectionKey: keyof SiteContent, data: any) => {
    setSaveStatus(prev => ({ ...prev, [sectionKey]: 'saving' }))
    const success = await updateSection(sectionKey, data)
    if (success) {
      setSaveStatus(prev => ({ ...prev, [sectionKey]: 'success' }))
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [sectionKey]: 'idle' }))
      }, 3000)
    } else {
      setSaveStatus(prev => ({ ...prev, [sectionKey]: 'error' }))
    }
  }

  const isLoggedIn = isSupabaseConfigured ? !!session : isDemoLoggedIn

  // --- RENDER DA TELA DE LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="admin-login-container">
        <style dangerouslySetInnerHTML={{ __html: `
          .admin-login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #1a0e08;
            background-image: radial-gradient(circle at top right, #2C1810, #1a0e08);
            font-family: 'DM Sans', sans-serif;
            color: #FAF6F0;
            padding: 24px;
          }
          .login-card {
            width: 100%;
            max-width: 420px;
            background: #2C1810;
            border: 1px solid rgba(139,69,19,0.3);
            border-radius: 4px;
            padding: 40px 32px;
            box-shadow: 0 24px 64px rgba(0,0,0,0.5);
            text-align: center;
          }
          .login-logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 20px;
            border: 2px solid #C4B49A;
          }
          .login-card h2 {
            font-family: 'Playfair Display', serif;
            color: #FAF6F0;
            font-size: 2rem;
            margin-bottom: 8px;
          }
          .login-card p {
            color: #C4B49A;
            font-size: 0.85rem;
            margin: 0 auto 30px;
          }
          .form-group {
            text-align: left;
            margin-bottom: 20px;
          }
          .form-group label {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #C4B49A;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .form-input {
            width: 100%;
            padding: 14px 16px;
            background: #1a0e08;
            border: 1px solid rgba(139,69,19,0.25);
            color: #FAF6F0;
            border-radius: 2px;
            font-size: 0.95rem;
            transition: border-color 0.3s;
          }
          .form-input:focus {
            outline: none;
            border-color: #8B4513;
          }
          .login-btn {
            width: 100%;
            padding: 16px;
            background: #8B4513;
            color: #FAF6F0;
            border: none;
            border-radius: 2px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: background 0.3s;
            margin-top: 10px;
          }
          .login-btn:hover {
            background: #A0612B;
          }
          .auth-error {
            background: rgba(220,53,69,0.15);
            border: 1px solid rgba(220,53,69,0.3);
            color: #f8d7da;
            padding: 12px;
            border-radius: 2px;
            font-size: 0.8rem;
            margin-bottom: 20px;
            text-align: left;
          }
          .demo-badge {
            display: inline-block;
            background: #2A5A5A;
            color: #FAF6F0;
            font-size: 0.65rem;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 10px;
            margin-top: 10px;
            letter-spacing: 0.05em;
          }
        `}} />

        <div className="login-card">
          <img src="./logo.png" alt="Canela Café" className="login-logo" />
          <h2>Painel Canela</h2>
          <p>Área administrativa do site</p>

          {!isSupabaseConfigured && (
            <span className="demo-badge">MODO DEMONSTRAÇÃO (OFFLINE)</span>
          )}

          {authError && <div className="auth-error">{authError}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>E-mail de Usuário</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Senha de Acesso</label>
              <input
                type="password"
                className="form-input"
                placeholder={!isSupabaseConfigured ? "Senha padrão: canela2026" : "Sua senha do Supabase"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={authLoading}>
              {authLoading ? 'Verificando...' : 'Entrar no Painel'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // --- RENDER DO DASHBOARD GERAL ---
  return (
    <div className="admin-dashboard">
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-dashboard {
          min-height: 100vh;
          background: #FAF6F0;
          color: #1a0e08;
          font-family: 'DM Sans', sans-serif;
          padding-top: 80px;
        }
        .admin-header {
          background: #1a0e08;
          color: #FAF6F0;
          padding: 24px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #8B4513;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }
        .admin-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #FAF6F0;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-header h1 span {
          font-size: 0.75rem;
          background: #8B4513;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .logout-btn {
          padding: 10px 20px;
          border: 1px solid #FAF6F0;
          color: #FAF6F0;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border-radius: 2px;
        }
        .logout-btn:hover {
          background: #FAF6F0;
          color: #1a0e08;
        }
        .admin-layout {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 40px;
        }
        .admin-sidebar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tab-btn {
          width: 100%;
          text-align: left;
          padding: 14px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 4px;
          color: #5C4A3A;
          transition: all 0.3s;
          background: transparent;
        }
        .tab-btn:hover {
          background: #F0E8DC;
          color: #8B4513;
        }
        .tab-btn.active {
          background: #8B4513;
          color: #FAF6F0;
        }
        .admin-content {
          background: #FDF9F3;
          border: 1px solid rgba(139,69,19,0.12);
          border-radius: 4px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(26,14,8,0.02);
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: #2C1810;
          margin-bottom: 12px;
          border-bottom: 2px solid rgba(139,69,19,0.15);
          padding-bottom: 12px;
        }
        .admin-form-group {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .admin-form-group label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: bold;
          color: #5C4A3A;
        }
        .admin-input, .admin-textarea, .admin-select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(139,69,19,0.2);
          border-radius: 2px;
          font-family: inherit;
          font-size: 0.95rem;
          background: #FAF6F0;
        }
        .admin-input:focus, .admin-textarea:focus, .admin-select:focus {
          outline: none;
          border-color: #8B4513;
        }
        .save-btn {
          background: #8B4513;
          color: #FAF6F0;
          font-weight: 600;
          padding: 12px 28px;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .save-btn:hover {
          background: #A0612B;
        }
        .save-success {
          color: #28a745;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .file-upload-wrapper {
          position: relative;
          display: inline-block;
          margin-top: 4px;
        }
        .file-upload-input {
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .file-upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #FAF6F0;
          border: 1px dashed #8B4513;
          border-radius: 2px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #8B4513;
        }
        .image-preview {
          margin-top: 12px;
          width: 120px;
          height: 90px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid rgba(139,69,19,0.15);
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .product-item {
          background: #FAF6F0;
          border: 1px solid rgba(139,69,19,0.12);
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .product-item-img {
          width: 100%;
          height: 140px;
          object-fit: cover;
        }
        .product-item-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .product-item-title {
          font-family: 'Playfair Display', serif;
          font-weight: bold;
          font-size: 1rem;
          margin-bottom: 4px;
        }
        .product-item-price {
          color: #8B4513;
          font-weight: bold;
          font-size: 0.9rem;
        }
        .product-item-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(139,69,19,0.08);
        }
        .action-edit {
          color: #2A5A5A;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .action-delete {
          color: #dc3545;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .text-accordion {
          border: 1px solid rgba(139,69,19,0.12);
          border-radius: 4px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .text-accordion-header {
          background: #F0E8DC;
          padding: 16px 24px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #2C1810;
        }
        .text-accordion-body {
          padding: 24px;
          background: #FDF9F3;
        }
      `}} />

      <header className="admin-header">
        <h1>
          Canela Café <span>Painel Administrativo</span>
        </h1>
        <button onClick={handleLogout} className="logout-btn">Sair do Painel</button>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button
            onClick={() => setActiveTab('cardapio')}
            className={`tab-btn ${activeTab === 'cardapio' ? 'active' : ''}`}
          >
            🍔 Cardápio Completo
          </button>
          <button
            onClick={() => setActiveTab('loja')}
            className={`tab-btn ${activeTab === 'loja' ? 'active' : ''}`}
          >
            🛍️ Vitrine da Loja
          </button>
          <button
            onClick={() => setActiveTab('paginas')}
            className={`tab-btn ${activeTab === 'paginas' ? 'active' : ''}`}
          >
            📖 Textos das Páginas
          </button>
          <button
            onClick={() => setActiveTab('contatos')}
            className={`tab-btn ${activeTab === 'contatos' ? 'active' : ''}`}
          >
            📍 Contatos & Informações
          </button>
        </aside>

        <main className="admin-content">
          {/* ==================== TAB: CARDÁPIO ==================== */}
          {activeTab === 'cardapio' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="section-title" style={{ margin: 0, border: 0 }}>Gerenciamento de Cardápio</h2>
                {!isAddingMenuProduct && !editingMenuProduct && (
                  <button onClick={() => setIsAddingMenuProduct(true)} className="save-btn">
                    ➕ Adicionar Novo Produto
                  </button>
                )}
              </div>

              {/* Formulário de Adicionar / Editar */}
              {(isAddingMenuProduct || editingMenuProduct) && (
                <form onSubmit={saveMenuProduct} style={{ background: '#F0E8DC', padding: '24px', borderRadius: '4px', marginBottom: '32px' }}>
                  <h3 style={{ marginBottom: '16px', fontFamily: 'Playfair Display' }}>
                    {editingMenuProduct ? `Editar: ${editingMenuProduct.title}` : 'Adicionar Novo Item ao Cardápio'}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="admin-form-group">
                      <label>Título do Produto</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingMenuProduct ? editingMenuProduct.title : menuForm.title}
                        onChange={(e) => {
                          const val = e.target.value
                          if (editingMenuProduct) setEditingMenuProduct(p => p ? { ...p, title: val } : null)
                          else setMenuForm(p => ({ ...p, title: val }))
                        }}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Preço (ex: R$ 34,90)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingMenuProduct ? editingMenuProduct.price : menuForm.price}
                        onChange={(e) => {
                          const val = e.target.value
                          if (editingMenuProduct) setEditingMenuProduct(p => p ? { ...p, price: val } : null)
                          else setMenuForm(p => ({ ...p, price: val }))
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Descrição Completa</label>
                    <textarea
                      rows={3}
                      className="admin-textarea"
                      value={editingMenuProduct ? editingMenuProduct.description : menuForm.description}
                      onChange={(e) => {
                        const val = e.target.value
                        if (editingMenuProduct) setEditingMenuProduct(p => p ? { ...p, description: val } : null)
                        else setMenuForm(p => ({ ...p, description: val }))
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="admin-form-group">
                      <label>Categoria Principal</label>
                      <select
                        className="admin-select"
                        value={editingMenuProduct ? (editingMenuProduct.category?.[0] || 'hamburgers') : menuForm.category}
                        onChange={(e) => {
                          const val = e.target.value as Category
                          if (editingMenuProduct) setEditingMenuProduct(p => p ? { ...p, category: [val] } : null)
                          else setMenuForm(p => ({ ...p, category: val }))
                        }}
                      >
                        <option value="marmitex">Marmitex (11h às 14h)</option>
                        <option value="pratos">Pratos Executivos</option>
                        <option value="hamburgers">Hamburgers</option>
                        <option value="hotdogs">Hot Dogs</option>
                        <option value="porcoes">Porções</option>
                        <option value="milkshakes">Milk-shakes</option>
                        <option value="bebidas">Bebidas</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Destaque / Badge (ex: Mais Pedido, Premium, Vegano)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Deixe em branco se não houver"
                        value={editingMenuProduct ? (editingMenuProduct.tag || '') : menuForm.tag}
                        onChange={(e) => {
                          const val = e.target.value
                          if (editingMenuProduct) setEditingMenuProduct(p => p ? { ...p, tag: val } : null)
                          else setMenuForm(p => ({ ...p, tag: val }))
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Imagem do Produto</label>
                    <div className="file-upload-wrapper">
                      <button type="button" className="file-upload-btn">
                        📷 {uploadingImage ? 'Enviando Imagem...' : 'Escolher Nova Imagem'}
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        className="file-upload-input"
                        onChange={(e) => handleImageUpload(e, 'menu')}
                        disabled={uploadingImage}
                      />
                    </div>
                    {(editingMenuProduct ? editingMenuProduct.image : menuForm.image) && (
                      <img
                        src={editingMenuProduct ? editingMenuProduct.image : menuForm.image}
                        alt="Preview"
                        className="image-preview"
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button type="submit" className="save-btn" disabled={loading}>
                      {loading ? 'Salvando...' : 'Confirmar & Salvar'}
                    </button>
                    <button
                      type="button"
                      className="tab-btn"
                      style={{ border: '1px solid #5C4A3A', width: 'auto', padding: '12px 24px' }}
                      onClick={() => {
                        setIsAddingMenuProduct(false)
                        setEditingMenuProduct(null)
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Lista dos Produtos Existentes */}
              <div className="product-grid">
                {menuItems.map((item) => (
                  <div key={item.id || item.title} className="product-item">
                    <img src={item.image} alt={item.title} className="product-item-img" />
                    <div className="product-item-body">
                      <div>
                        <div className="product-item-title">{item.title}</div>
                        <div className="product-item-price">{item.price}</div>
                        <div style={{ fontSize: '0.7rem', color: '#8B7B6B', textTransform: 'uppercase', marginTop: '4px' }}>
                          Categoria: {item.category.join(', ')}
                        </div>
                      </div>
                      <div className="product-item-actions">
                        <button onClick={() => setEditingMenuProduct(item)} className="action-edit">✏️ Editar</button>
                        <button onClick={() => item.id && deleteMenuProduct(item.id)} className="action-delete">❌ Excluir</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB: VITRINE DA LOJA ==================== */}
          {activeTab === 'loja' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="section-title" style={{ margin: 0, border: 0 }}>Vitrine de Produtos Físicos</h2>
                {!isAddingStoreProduct && !editingStoreProduct && (
                  <button onClick={() => setIsAddingStoreProduct(true)} className="save-btn">
                    ➕ Adicionar Novo Produto Vitrine
                  </button>
                )}
              </div>

              {/* Formulário CRUD Loja */}
              {(isAddingStoreProduct || editingStoreProduct) && (
                <form onSubmit={saveStoreProduct} style={{ background: '#F0E8DC', padding: '24px', borderRadius: '4px', marginBottom: '32px' }}>
                  <h3 style={{ marginBottom: '16px', fontFamily: 'Playfair Display' }}>
                    {editingStoreProduct ? `Editar: ${editingStoreProduct.title}` : 'Adicionar Produto à Vitrine'}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
                    <div className="admin-form-group">
                      <label>Nome do Produto</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingStoreProduct ? editingStoreProduct.title : storeForm.title}
                        onChange={(e) => {
                          const val = e.target.value
                          if (editingStoreProduct) setEditingStoreProduct(p => p ? { ...p, title: val } : null)
                          else setStoreForm(p => ({ ...p, title: val }))
                        }}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Preço</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingStoreProduct ? editingStoreProduct.price : storeForm.price}
                        onChange={(e) => {
                          const val = e.target.value
                          if (editingStoreProduct) setEditingStoreProduct(p => p ? { ...p, price: val } : null)
                          else setStoreForm(p => ({ ...p, price: val }))
                        }}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Peso/Formato (ex: 250g, Unidade)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingStoreProduct ? editingStoreProduct.weight : storeForm.weight}
                        onChange={(e) => {
                          const val = e.target.value
                          if (editingStoreProduct) setEditingStoreProduct(p => p ? { ...p, weight: val } : null)
                          else setStoreForm(p => ({ ...p, weight: val }))
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    <div className="admin-form-group">
                      <label>Descrição Curta / Detalhes</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingStoreProduct ? editingStoreProduct.description : storeForm.description}
                        onChange={(e) => {
                          const val = e.target.value
                          if (editingStoreProduct) setEditingStoreProduct(p => p ? { ...p, description: val } : null)
                          else setStoreForm(p => ({ ...p, description: val }))
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Badge de Destaque</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="ex: Mais Vendido, Premium"
                        value={editingStoreProduct ? (editingStoreProduct.badge || '') : storeForm.badge}
                        onChange={(e) => {
                          const val = e.target.value
                          if (editingStoreProduct) setEditingStoreProduct(p => p ? { ...p, badge: val } : null)
                          else setStoreForm(p => ({ ...p, badge: val }))
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Imagem do Produto da Loja</label>
                    <div className="file-upload-wrapper">
                      <button type="button" className="file-upload-btn">
                        📷 {uploadingImage ? 'Enviando...' : 'Escolher Imagem'}
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        className="file-upload-input"
                        onChange={(e) => handleImageUpload(e, 'store')}
                        disabled={uploadingImage}
                      />
                    </div>
                    {(editingStoreProduct ? editingStoreProduct.image : storeForm.image) && (
                      <img
                        src={editingStoreProduct ? editingStoreProduct.image : storeForm.image}
                        alt="Preview"
                        className="image-preview"
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button type="submit" className="save-btn" disabled={loading}>
                      {loading ? 'Salvando...' : 'Confirmar & Salvar'}
                    </button>
                    <button
                      type="button"
                      className="tab-btn"
                      style={{ border: '1px solid #5C4A3A', width: 'auto', padding: '12px 24px' }}
                      onClick={() => {
                        setIsAddingStoreProduct(false)
                        setEditingStoreProduct(null)
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Lista dos Itens da Vitrine */}
              <div className="product-grid">
                {storeItems.map((item) => (
                  <div key={item.id || item.title} className="product-item">
                    <img src={item.image} alt={item.title} className="product-item-img" />
                    <div className="product-item-body">
                      <div>
                        <div className="product-item-title">{item.title}</div>
                        <div className="product-item-price">{item.price} / {item.weight}</div>
                        <p style={{ fontSize: '0.8rem', color: '#8B7B6B', margin: '4px 0 0' }}>{item.description}</p>
                      </div>
                      <div className="product-item-actions">
                        <button onClick={() => setEditingStoreProduct(item)} className="action-edit">✏️ Editar</button>
                        <button onClick={() => item.id && deleteStoreProduct(item.id)} className="action-delete">❌ Excluir</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB: TEXTOS DAS PÁGINAS ==================== */}
          {activeTab === 'paginas' && (
            <div>
              <h2 className="section-title">Edição de Textos e Banners</h2>

              {/* 1. SEÇÃO HERO */}
              <div className="text-accordion">
                <div className="text-accordion-header">🏠 Seção de Entrada (Banner Hero)</div>
                <div className="text-accordion-body">
                  <div className="admin-form-group">
                    <label>Título Principal do Site</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={heroForm.title}
                      onChange={(e) => setHeroForm(p => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Subtítulo do Site</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={heroForm.subtitle}
                      onChange={(e) => setHeroForm(p => ({ ...p, subtitle: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Frase de Efeito (Tagline)</label>
                    <textarea
                      rows={3}
                      className="admin-textarea"
                      value={heroForm.tagline}
                      onChange={(e) => setHeroForm(p => ({ ...p, tagline: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Imagem de Fundo do Banner</label>
                    <div className="file-upload-wrapper">
                      <button type="button" className="file-upload-btn">📷 Mudar Foto do Banner</button>
                      <input type="file" accept="image/*" className="file-upload-input" onChange={(e) => handleImageUpload(e, 'hero')} />
                    </div>
                    <img src={heroForm.bg_image} alt="Hero Preview" className="image-preview" style={{ width: '200px', height: '100px' }} />
                  </div>
                  <button onClick={() => saveTextSection('hero', heroForm)} className="save-btn">
                    💾 Salvar Seção Hero
                  </button>
                  {saveStatus['hero'] === 'success' && <span className="save-success"> ✓ Alterações salvas!</span>}
                </div>
              </div>

              {/* 2. SEÇÃO SOBRE NÓS */}
              <div className="text-accordion">
                <div className="text-accordion-header">📖 Seção institucional (Quem Somos)</div>
                <div className="text-accordion-body">
                  <div className="admin-form-group">
                    <label>Etiqueta Pequena (Eyebrow)</label>
                    <input type="text" className="admin-input" value={aboutForm.eyebrow} onChange={(e) => setAboutForm(p => ({ ...p, eyebrow: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label>Título da História</label>
                    <input type="text" className="admin-input" value={aboutForm.title} onChange={(e) => setAboutForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label>Parágrafo Histórico 1</label>
                    <textarea rows={3} className="admin-textarea" value={aboutForm.paragraph_1} onChange={(e) => setAboutForm(p => ({ ...p, paragraph_1: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label>Parágrafo Histórico 2</label>
                    <textarea rows={3} className="admin-textarea" value={aboutForm.paragraph_2} onChange={(e) => setAboutForm(p => ({ ...p, paragraph_2: e.target.value }))} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div className="admin-form-group">
                      <label>Stat 1 Valor (ex: 4.9K+)</label>
                      <input type="text" className="admin-input" value={aboutForm.stat1_val} onChange={(e) => setAboutForm(p => ({ ...p, stat1_val: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label>Stat 1 Rótulo</label>
                      <input type="text" className="admin-input" value={aboutForm.stat1_lbl} onChange={(e) => setAboutForm(p => ({ ...p, stat1_lbl: e.target.value }))} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div className="admin-form-group">
                      <label>Stat 2 Valor (ex: ☕)</label>
                      <input type="text" className="admin-input" value={aboutForm.stat2_val} onChange={(e) => setAboutForm(p => ({ ...p, stat2_val: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label>Stat 2 Rótulo</label>
                      <input type="text" className="admin-input" value={aboutForm.stat2_lbl} onChange={(e) => setAboutForm(p => ({ ...p, stat2_lbl: e.target.value }))} />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Foto 1 (Ambiente/Curso)</label>
                    <div className="file-upload-wrapper">
                      <input type="file" accept="image/*" className="file-upload-input" onChange={(e) => handleImageUpload(e, 'about1')} />
                      <button type="button" className="file-upload-btn">📷 Enviar Nova Foto 1</button>
                    </div>
                    <img src={aboutForm.image_1} alt="Preview 1" className="image-preview" />
                  </div>

                  <div className="admin-form-group">
                    <label>Foto 2 (Pratos/Café)</label>
                    <div className="file-upload-wrapper">
                      <input type="file" accept="image/*" className="file-upload-input" onChange={(e) => handleImageUpload(e, 'about2')} />
                      <button type="button" className="file-upload-btn">📷 Enviar Nova Foto 2</button>
                    </div>
                    <img src={aboutForm.image_2} alt="Preview 2" className="image-preview" />
                  </div>

                  <button onClick={() => saveTextSection('about', aboutForm)} className="save-btn">
                    💾 Salvar Alterações de Sobre Nós
                  </button>
                  {saveStatus['about'] === 'success' && <span className="save-success"> ✓ Salvo!</span>}
                </div>
              </div>

              {/* 3. SEÇÃO ASSINATURA */}
              <div className="text-accordion">
                <div className="text-accordion-header">📦 Clube de Assinatura Canela VIP</div>
                <div className="text-accordion-body">
                  <div className="admin-form-group">
                    <label>Título Informativo</label>
                    <input type="text" className="admin-input" value={assinaturaForm.title} onChange={(e) => setAssinaturaForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label>Descrição do Clube</label>
                    <textarea rows={3} className="admin-textarea" value={assinaturaForm.description} onChange={(e) => setAssinaturaForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label>Título do Banner Oferta (ex: Garanta seu café...)</label>
                    <input type="text" className="admin-input" value={assinaturaForm.offer_title} onChange={(e) => setAssinaturaForm(p => ({ ...p, offer_title: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label>Descrição do Valor (ex: Planos a partir de...)</label>
                    <input type="text" className="admin-input" value={assinaturaForm.offer_desc} onChange={(e) => setAssinaturaForm(p => ({ ...p, offer_desc: e.target.value }))} />
                  </div>
                  <button onClick={() => saveTextSection('assinatura', assinaturaForm)} className="save-btn">
                    💾 Salvar Assinatura
                  </button>
                  {saveStatus['assinatura'] === 'success' && <span className="save-success"> ✓ Salvo!</span>}
                </div>
              </div>

              {/* 4. SEÇÃO B2B */}
              <div className="text-accordion">
                <div className="text-accordion-header">💼 Atendimento Corporativo (B2B)</div>
                <div className="text-accordion-body">
                  <div className="admin-form-group">
                    <label>Título da Proposta B2B</label>
                    <input type="text" className="admin-input" value={b2bForm.title} onChange={(e) => setB2bForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label>Parágrafo de Soluções Corporativas</label>
                    <textarea rows={3} className="admin-textarea" value={b2bForm.description} onChange={(e) => setB2bForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <button onClick={() => saveTextSection('b2b', b2bForm)} className="save-btn">
                    💾 Salvar Proposta B2B
                  </button>
                  {saveStatus['b2b'] === 'success' && <span className="save-success"> ✓ Salvo!</span>}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: CONTATOS & INFO ==================== */}
          {activeTab === 'contatos' && (
            <div>
              <h2 className="section-title">Contatos e Horários Globais</h2>

              <div className="admin-form-group">
                <label>Telefone WhatsApp (Apenas Números com DDD)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="ex: 5516997427103"
                  value={contactForm.telefone_whatsapp}
                  onChange={(e) => setContactForm(p => ({ ...p, telefone_whatsapp: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <label>E-mail Corporativo de Contato</label>
                <input
                  type="email"
                  className="admin-input"
                  value={contactForm.email_contato}
                  onChange={(e) => setContactForm(p => ({ ...p, email_contato: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <label>Endereço Físico Completo</label>
                <input
                  type="text"
                  className="admin-input"
                  value={contactForm.endereco_rua}
                  onChange={(e) => setContactForm(p => ({ ...p, endereco_rua: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <label>Horário de Funcionamento por Extenso</label>
                <input
                  type="text"
                  className="admin-input"
                  value={contactForm.horario_funcionamento}
                  onChange={(e) => setContactForm(p => ({ ...p, horario_funcionamento: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <label>Link Direto do Cardápio / Delivery (ex: G3Food)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={contactForm.delivery_link}
                  onChange={(e) => setContactForm(p => ({ ...p, delivery_link: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <label>Link da Conta do Instagram</label>
                <input
                  type="text"
                  className="admin-input"
                  value={contactForm.instagram_link}
                  onChange={(e) => setContactForm(p => ({ ...p, instagram_link: e.target.value }))}
                />
              </div>

              <div style={{ marginTop: '28px' }}>
                <button onClick={() => saveTextSection('general', contactForm)} className="save-btn">
                  💾 Salvar Configurações Gerais
                </button>
                {saveStatus['general'] === 'success' && <span className="save-success"> ✓ Dados salvos!</span>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
