-- =======================================================
-- SQL SCHEMA & SEED DATA - CANELA CAFÉ
-- Cole este script no SQL Editor do Supabase e clique em RUN
-- =======================================================

-- 1. TABELA DE SEÇÕES DE CONTEÚDO DO SITE
CREATE TABLE IF NOT EXISTS site_sections (
  section_id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurando Políticas de Segurança (RLS) para site_sections
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública para seções" ON site_sections;
CREATE POLICY "Leitura pública para seções" ON site_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Modificação apenas para autenticados" ON site_sections;
CREATE POLICY "Modificação apenas para autenticados" ON site_sections FOR ALL TO authenticated USING (true);

-- 2. TABELA DE PRODUTOS DO CARDÁPIO (MENU)
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  image_url TEXT,
  category TEXT[] NOT NULL,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurando Políticas de Segurança (RLS) para produtos
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública para produtos" ON produtos;
CREATE POLICY "Leitura pública para produtos" ON produtos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Modificação de produtos para autenticados" ON produtos;
CREATE POLICY "Modificação de produtos para autenticados" ON produtos FOR ALL TO authenticated USING (true);

-- 3. TABELA DE VITRINE DA LOJA
CREATE TABLE IF NOT EXISTS produtos_loja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  weight TEXT NOT NULL,
  image_url TEXT,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurando Políticas de Segurança (RLS) para produtos_loja
ALTER TABLE produtos_loja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública para produtos_loja" ON produtos_loja;
CREATE POLICY "Leitura pública para produtos_loja" ON produtos_loja FOR SELECT USING (true);

DROP POLICY IF EXISTS "Modificação de produtos_loja para autenticados" ON produtos_loja;
CREATE POLICY "Modificação de produtos_loja para autenticados" ON produtos_loja FOR ALL TO authenticated USING (true);

-- =======================================================
-- POPULANDO O BANCO DE DADOS (SEED DATA)
-- Insere os dados padrão iniciais para o site não iniciar vazio
-- =======================================================

-- Seções de Conteúdo Iniciais
INSERT INTO site_sections (section_id, content) VALUES
('general', '{
  "telefone_whatsapp": "5516997427103",
  "email_contato": "b2b@canelacafe.com.br",
  "endereco_rua": "Rua Pedro Javaroni, 306 — Ribeirão Preto, SP",
  "horario_funcionamento": "Segunda a Sábado: 6h às 18h",
  "delivery_link": "https://g3food.com.br/canelacafe",
  "instagram_link": "https://www.instagram.com/canelacafe.emporio/",
  "facebook_link": "https://www.facebook.com/"
}'),
('hero', '{
  "title": "Canela Café",
  "subtitle": "Empório & Cafeteria",
  "tagline": "Dê uma pausa na sua rotina e venha tomar um cafezinho conosco.\\nCafés especiais, pratos artesanais e o melhor atendimento de Ribeirão Preto.",
  "bg_image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80",
  "logo_image": "./logo.png",
  "whatsapp_btn_label": "Fazer Pedido",
  "menu_btn_label": "Ver Cardápio"
}'),
('about', '{
  "eyebrow": "Nossa história",
  "title": "Seu paladar merece uma cafeteria como a nossa",
  "paragraph_1": "O Canela Café Empório nasceu da paixão por café de verdade. Aqui em Ribeirão Preto, criamos um espaço onde cada xícara conta uma história — desde os grãos selecionados da Alta Mogiana até a torra artesanal feita com carinho.",
  "paragraph_2": "Mais que uma cafeteria, somos um ponto de encontro. Oferecemos cafés especiais gourmet, pratos executivos caseiros, burgers artesanais, sobremesas irresistíveis e até cursos de barista para quem quer mergulhar nesse universo.",
  "stat1_val": "4.9K+",
  "stat1_lbl": "Seguidores no Instagram",
  "stat2_val": "☕",
  "stat2_lbl": "Café Gourmet 83+ pts",
  "stat3_val": "6h–18h",
  "stat3_lbl": "Seg a Sáb",
  "image_1": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
  "image_2": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80"
}'),
('assinatura', '{
  "eyebrow": "Clube de Assinatura",
  "title": "Como funciona o Clube Canela?",
  "description": "Não fique sem seu café especial. Assine nosso clube e receba mensalmente no conforto da sua casa os melhores grãos com torra fresca.",
  "offer_eyebrow": "Oferta Especial",
  "offer_title": "Garanta seu café para o mês inteiro",
  "offer_desc": "Planos a partir de R$ 49,90 por mês com entrega grátis em Ribeirão Preto.",
  "offer_btn_label": "Assinar Agora",
  "offer_image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80",
  "steps": [
    {
      "icon": "📦",
      "title": "Escolha seu plano",
      "desc": "Café em grãos ou moído fresco. Na medida certa para o seu consumo mensal."
    },
    {
      "icon": "☕",
      "title": "Curadoria do Barista",
      "desc": "Receba os melhores microlotes da Alta Mogiana selecionados por nossos especialistas."
    },
    {
      "icon": "🎁",
      "title": "Surpresas e Brindes",
      "desc": "Todo mês uma experiência sensorial nova com amostras e brindes exclusivos."
    },
    {
      "icon": "⭐",
      "title": "Vantagens VIP",
      "desc": "Assinantes ganham 10% OFF em todas as compras na loja física e online."
    }
  ]
}'),
('b2b', '{
  "eyebrow": "Para Empresas",
  "title": "Leve a experiência Canela Café para o seu negócio",
  "description": "Atendemos empresas com soluções personalizadas de café e alimentação. Desde coffee breaks para reuniões até fornecimento regular de café gourmet para o escritório.",
  "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
  "features": [
    {
      "icon": "☕",
      "title": "Coffee Break",
      "desc": "Cafés especiais e snacks para reuniões e eventos corporativos."
    },
    {
      "icon": "🍽️",
      "title": "Almoço Executivo",
      "desc": "Pratos caseiros para equipes. Entrega em horário combinado."
    },
    {
      "icon": "🎓",
      "title": "Curso de Barista",
      "desc": "Treinamentos e workshops de café para equipes e eventos."
    },
    {
      "icon": "📦",
      "title": "Fornecimento",
      "desc": "Café gourmet em grãos ou moído para escritórios e estabelecimentos."
    }
  ]
}')
ON CONFLICT (section_id) DO UPDATE 
SET content = EXCLUDED.content, updated_at = NOW();

-- Produtos Iniciais do Cardápio
INSERT INTO produtos (title, description, price, category, tag, image_url) VALUES
('Marmitex Executiva', '2 misturas, 2 guarnições e acompanha salada.', 'R$ 39,90', ARRAY['marmitex'], NULL, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'),
('Marmitex Grande', 'Escolha 2 acompanhamentos e 3 guarnições.', 'R$ 37,90', ARRAY['marmitex'], NULL, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'),
('Contra Filé a Cavalo', 'Acompanha arroz, feijão, contra file grelhado, ovo frito, batata frita e salada.', 'R$ 34,90', ARRAY['pratos'], 'Clássico', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'),
('C&B Bacon', 'Pão de brioche, burger artesanal 150g, bacon, cheddar e maionese de bacon.', 'R$ 34,00', ARRAY['hamburgers'], 'Mais Pedido', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80'),
('C&B Dog Bacon', 'Pão de hot dog, salsicha, bacon, ketchup, maionese, mostarda e batata palha.', 'R$ 22,00', ARRAY['hotdogs'], NULL, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'),
('Milkshake Ninho c/ Nutella', 'O sabor mais desejado.', 'R$ 30,00', ARRAY['milkshakes'], 'Sobremesa Mestre', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80');

-- Produtos Iniciais da Vitrine da Loja
INSERT INTO produtos_loja (title, description, price, weight, badge, image_url) VALUES
('Café Especial Catuai 62', '82 pontos · Notas de chocolate e caramelo', 'R$ 37,00', '250g', 'Mais Vendido', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80'),
('Café Gourmet Alta Mogiana', '84 pontos · Torra média, mais cremoso', 'R$ 54,00', '500g', 'Premium', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=500&q=80'),
('Kit Café + Prensa Francesa', 'O presente perfeito para quem ama café', 'R$ 129,90', 'Kit', NULL, 'https://images.unsplash.com/photo-1522012147041-30a1126a1b6e?auto=format&fit=crop&w=500&q=80');
