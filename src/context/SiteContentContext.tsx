import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Importações dos assets padrão (Fallbacks)
import heroBgDefault from '../assets/images/ambiente.jpg'
import cursoBaristaDefault from '../assets/images/curso-barista.jpg'
import cafeGourmetDefault from '../assets/images/cafe-gourmet.jpg'
import burgerDefault from '../assets/images/burger.jpg'
import pratoDefault from '../assets/images/prato-executivo.jpg'
import curso2Default from '../assets/images/curso2.jpg'
import cafeEspecialDefault from '../assets/images/cafe-especial.jpg'
import destaqueDefault from '../assets/images/destaque1.jpg'

// --- DEFINIÇÕES DE TIPOS ---

export type Category = 'todos' | 'marmitex' | 'pratos' | 'hamburgers' | 'hotdogs' | 'porcoes' | 'milkshakes' | 'bebidas'

export interface MenuItem {
  id?: string
  title: string
  description?: string
  price: string
  image: string
  category: Category[]
  tag?: string
}

export interface StoreItem {
  id?: string
  title: string
  price: string
  weight: string
  image: string
  badge?: string
  description?: string
}

export interface SiteContent {
  general: {
    telefone_whatsapp: string
    email_contato: string
    endereco_rua: string
    horario_funcionamento: string
    delivery_link: string
    instagram_link: string
    facebook_link: string
  }
  hero: {
    title: string
    subtitle: string
    tagline: string
    bg_image: string
    logo_image: string
    whatsapp_btn_label: string
    menu_btn_label: string
  }
  about: {
    eyebrow: string
    title: string
    paragraph_1: string
    paragraph_2: string
    stat1_val: string
    stat1_lbl: string
    stat2_val: string
    stat2_lbl: string
    stat3_val: string
    stat3_lbl: string
    image_1: string
    image_2: string
  }
  assinatura: {
    eyebrow: string
    title: string
    description: string
    offer_eyebrow: string
    offer_title: string
    offer_desc: string
    offer_btn_label: string
    offer_image: string
    steps: Array<{ icon: string; title: string; desc: string }>
  }
  b2b: {
    eyebrow: string
    title: string
    description: string
    image: string
    features: Array<{ icon: string; title: string; desc: string }>
  }
}

interface SiteContentContextType {
  siteData: SiteContent
  menuItems: MenuItem[]
  storeItems: StoreItem[]
  loading: boolean
  updateSection: (sectionKey: keyof SiteContent, data: any) => Promise<boolean>
  refreshData: () => Promise<void>
}

// --- VALORES PADRÃO (FALLBACKS) ---

const DEFAULT_SITE_DATA: SiteContent = {
  general: {
    telefone_whatsapp: '5516997427103',
    email_contato: 'b2b@canelacafe.com.br',
    endereco_rua: 'Rua Pedro Javaroni, 306 — Ribeirão Preto, SP',
    horario_funcionamento: 'Segunda a Sábado: 6h às 18h',
    delivery_link: 'https://g3food.com.br/canelacafe',
    instagram_link: 'https://www.instagram.com/canelacafe.emporio/',
    facebook_link: 'https://www.facebook.com/'
  },
  hero: {
    title: 'Canela Café',
    subtitle: 'Empório & Cafeteria',
    tagline: 'Dê uma pausa na sua rotina e venha tomar um cafezinho conosco.\nCafés especiais, pratos artesanais e o melhor atendimento de Ribeirão Preto.',
    bg_image: heroBgDefault,
    logo_image: './logo.png',
    whatsapp_btn_label: 'Fazer Pedido',
    menu_btn_label: 'Ver Cardápio'
  },
  about: {
    eyebrow: 'Nossa história',
    title: 'Seu paladar merece uma cafeteria como a nossa',
    paragraph_1: 'O Canela Café Empório nasceu da paixão por café de verdade. Aqui em Ribeirão Preto, criamos um espaço onde cada xícara conta uma história — desde os grãos selecionados da Alta Mogiana até a torra artesanal feita com carinho.',
    paragraph_2: 'Mais que uma cafeteria, somos um ponto de encontro. Oferecemos cafés especiais gourmet, pratos executivos caseiros, burgers artesanais, sobremesas irresistíveis e até cursos de barista para quem quer mergulhar nesse universo.',
    stat1_val: '4.9K+',
    stat1_lbl: 'Seguidores no Instagram',
    stat2_val: '☕',
    stat2_lbl: 'Café Gourmet 83+ pts',
    stat3_val: '6h–18h',
    stat3_lbl: 'Seg a Sáb',
    image_1: cursoBaristaDefault,
    image_2: cafeGourmetDefault
  },
  assinatura: {
    eyebrow: 'Clube de Assinatura',
    title: 'Como funciona o Clube Canela?',
    description: 'Não fique sem seu café especial. Assine nosso clube e receba mensalmente no conforto da sua casa os melhores grãos com torra fresca.',
    offer_eyebrow: 'Oferta Especial',
    offer_title: 'Garanta seu café para o mês inteiro',
    offer_desc: 'Planos a partir de R$ 49,90 por mês com entrega grátis em Ribeirão Preto.',
    offer_btn_label: 'Assinar Agora',
    offer_image: cafeGourmetDefault,
    steps: [
      {
        icon: '📦',
        title: 'Escolha seu plano',
        desc: 'Café em grãos ou moído fresco. Na medida certa para o seu consumo mensal.',
      },
      {
        icon: '☕',
        title: 'Curadoria do Barista',
        desc: 'Receba os melhores microlotes da Alta Mogiana selecionados por nossos especialistas.',
      },
      {
        icon: '🎁',
        title: 'Surpresas e Brindes',
        desc: 'Todo mês uma experiência sensorial nova com amostras e brindes exclusivos.',
      },
      {
        icon: '⭐',
        title: 'Vantagens VIP',
        desc: 'Assinantes ganham 10% OFF em todas as compras na loja física e online.',
      },
    ]
  },
  b2b: {
    eyebrow: 'Para Empresas',
    title: 'Leve a experiência Canela Café para o seu negócio',
    description: 'Atendemos empresas com soluções personalizadas de café e alimentação. Desde coffee breaks para reuniões até fornecimento regular de café gourmet para o escritório.',
    image: curso2Default,
    features: [
      {
        icon: '☕',
        title: 'Coffee Break',
        desc: 'Cafés especiais e snacks para reuniões e eventos corporativos.',
      },
      {
        icon: '🍽️',
        title: 'Almoço Executivo',
        desc: 'Pratos caseiros para equipes. Entrega em horário combinado.',
      },
      {
        icon: '🎓',
        title: 'Curso de Barista',
        desc: 'Treinamentos e workshops de café para equipes e eventos.',
      },
      {
        icon: '📦',
        title: 'Fornecimento',
        desc: 'Café gourmet em grãos ou moído para escritórios e estabelecimentos.',
      },
    ]
  }
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Marmitex Executiva',
    description: '2 misturas, 2 guarnições e acompanha salada.',
    price: 'R$ 39,90',
    category: ['marmitex'],
    image: pratoDefault
  },
  {
    title: 'Marmitex Grande',
    description: 'Escolha 2 acompanhamentos e 3 guarnições.',
    price: 'R$ 37,90',
    category: ['marmitex'],
    image: pratoDefault
  },
  {
    title: 'Marmitex Médio',
    description: 'Escolha 2 acompanhamentos e 3 guarnições.',
    price: 'R$ 32,90',
    category: ['marmitex'],
    image: pratoDefault
  },
  {
    title: 'Marmitex Pequeno',
    description: 'Escolha 1 acompanhamento e 2 guarnições.',
    price: 'R$ 28,90',
    category: ['marmitex'],
    image: pratoDefault
  },
  {
    title: 'Contra Filé',
    description: 'Acompanha arroz, feijão, contra file grelhado, batata frita e salada alface e tomate.',
    price: 'R$ 32,90',
    category: ['pratos'],
    image: pratoDefault
  },
  {
    title: 'Contra Filé a Cavalo',
    description: 'Acompanha arroz, feijão, contra file grelhado, ovo frito, batata frita e salada alface e tomate.',
    price: 'R$ 34,90',
    category: ['pratos'],
    tag: 'Clássico',
    image: pratoDefault
  },
  {
    title: 'Contra Filé com Linguiça Toscana',
    description: 'Acompanha arroz, feijão, contra file grelhado, linguiça toscana, batata frita e salada.',
    price: 'R$ 38,90',
    category: ['pratos'],
    image: pratoDefault
  },
  {
    title: 'C&B Bacon',
    description: 'Pão de brioche, burger artesanal 150g, bacon, cheddar e maionese de bacon.',
    price: 'R$ 34,00',
    category: ['hamburgers'],
    tag: 'Mais Pedido',
    image: burgerDefault
  },
  {
    title: 'C&B Dog Bacon',
    description: 'Pão de hot dog, salsicha, bacon, ketchup, maionese, mostarda e batata palha.',
    price: 'R$ 22,00',
    category: ['hotdogs'],
    image: pratoDefault
  },
  {
    title: 'Fritas c/ Bacon e Cheddar ou Muçarela',
    description: 'Batata frita com tempero chimichurri, sal, bacon e cobertura escolhida.',
    price: 'A partir de R$ 25,00',
    category: ['porcoes'],
    tag: 'Para Dividir',
    image: pratoDefault
  },
  {
    title: 'Milkshake Ninho c/ Nutella',
    description: 'O sabor mais desejado.',
    price: 'R$ 30,00',
    category: ['milkshakes'],
    tag: 'Sobremesa Mestre',
    image: cafeGourmetDefault
  },
  {
    title: 'Coca-Cola 350ML',
    price: 'R$ 6,00',
    category: ['bebidas'],
    image: cafeGourmetDefault
  }
]

const DEFAULT_STORE_ITEMS: StoreItem[] = [
  {
    title: 'Café Especial Catuai 62',
    price: 'R$ 37,00',
    weight: '250g',
    image: cafeEspecialDefault,
    badge: 'Mais Vendido',
    description: '82 pontos · Notas de chocolate e caramelo',
  },
  {
    title: 'Café Gourmet Alta Mogiana',
    price: 'R$ 54,00',
    weight: '500g',
    image: cafeGourmetDefault,
    badge: 'Premium',
    description: '84 pontos · Torra média, mais cremoso',
  },
  {
    title: 'Kit Café + Prensa Francesa',
    price: 'R$ 129,90',
    weight: 'Kit',
    image: destaqueDefault,
    description: 'O presente perfeito para quem ama café',
  }
]

// --- CONTEXTO ---

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined)

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteData, setSiteData] = useState<SiteContent>(DEFAULT_SITE_DATA)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS)
  const [storeItems, setStoreItems] = useState<StoreItem[]>(DEFAULT_STORE_ITEMS)
  const [loading, setLoading] = useState<boolean>(true)

  const refreshData = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // 1. Carregar Conteúdo do Site (Seções)
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('site_sections')
        .select('*')

      if (!sectionsError && sectionsData && sectionsData.length > 0) {
        const mergedData = { ...DEFAULT_SITE_DATA } as any
        sectionsData.forEach((row: any) => {
          if (row.section_id in mergedData) {
            mergedData[row.section_id] = {
              ...mergedData[row.section_id],
              ...row.content
            }
          }
        })
        setSiteData(mergedData)
      }

      // 2. Carregar Cardápio
      const { data: menuData, error: menuError } = await supabase
        .from('produtos')
        .select('*')
        .order('title', { ascending: true })

      if (!menuError && menuData && menuData.length > 0) {
        // Mapeia os dados do banco, tratando imagens
        const formattedMenu = menuData.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          image: item.image_url || pratoDefault,
          category: Array.isArray(item.category) ? item.category : [item.category],
          tag: item.tag || undefined
        }))
        setMenuItems(formattedMenu)
      }

      // 3. Carregar Produtos Loja
      const { data: storeData, error: storeError } = await supabase
        .from('produtos_loja')
        .select('*')
        .order('title', { ascending: true })

      if (!storeError && storeData && storeData.length > 0) {
        const formattedStore = storeData.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          weight: item.weight,
          image: item.image_url || cafeEspecialDefault,
          badge: item.badge || undefined,
          description: item.description
        }))
        setStoreItems(formattedStore)
      }

    } catch (err) {
      console.error('Erro ao buscar dados do Supabase:', err)
    } finally {
      setLoading(false)
    }
  }

  // Função para salvar alterações de seções pelo painel admin no Supabase
  const updateSection = async (sectionKey: keyof SiteContent, data: any): Promise<boolean> => {
    // Atualiza estado local imediatamente (Optimistic UI)
    const updatedData = {
      ...siteData,
      [sectionKey]: {
        ...siteData[sectionKey],
        ...data
      }
    }
    setSiteData(updatedData)

    if (!isSupabaseConfigured) {
      // No modo de demonstração local, salva no LocalStorage para testes interativos
      try {
        localStorage.setItem(`demo_section_${sectionKey}`, JSON.stringify(updatedData[sectionKey]))
        return true
      } catch (e) {
        return false
      }
    }

    try {
      // Salva no banco de dados Supabase
      const { error } = await supabase
        .from('site_sections')
        .upsert({
          section_id: sectionKey,
          content: updatedData[sectionKey],
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_id' })

      if (error) {
        console.error(`Erro ao salvar seção ${sectionKey}:`, error)
        return false
      }
      return true
    } catch (err) {
      console.error(`Erro ao salvar seção ${sectionKey}:`, err)
      return false
    }
  }

  // Efeito de inicialização
  useEffect(() => {
    // Carrega do LocalStorage se estivermos em modo demo
    if (!isSupabaseConfigured) {
      const loadedData = { ...DEFAULT_SITE_DATA } as any
      let hasLocalChanges = false

      Object.keys(DEFAULT_SITE_DATA).forEach((key) => {
        const cached = localStorage.getItem(`demo_section_${key}`)
        if (cached) {
          try {
            loadedData[key] = JSON.parse(cached)
            hasLocalChanges = true
          } catch (e) {}
        }
      })

      if (hasLocalChanges) {
        setSiteData(loadedData)
      }
    }

    refreshData()
  }, [])

  return (
    <SiteContentContext.Provider value={{ siteData, menuItems, storeItems, loading, updateSection, refreshData }}>
      {children}
    </SiteContentContext.Provider>
  )
}

export const useSiteContent = () => {
  const context = useContext(SiteContentContext)
  if (context === undefined) {
    throw new Error('useSiteContent deve ser usado dentro de um SiteContentProvider')
  }
  return context
}
