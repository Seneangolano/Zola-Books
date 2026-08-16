import { Book, User, Coupon, Review, Order, SellerSaleNotification } from '../types';

export const INITIAL_EXCHANGE_RATE = {
  // 1 USD = 930 AOA (Kwanza)
  // 1 EUR = 1010 AOA
  AOA_TO_USD: 1 / 930,
  USD_TO_AOA: 930,
  EUR_TO_AOA: 1010,
};

export const MOCK_BOOKS: Book[] = [
  {
    id: 'ZB-BK-101',
    title: 'Luuanda',
    subtitle: 'Estórias de amor, resistência e sabedoria dos musseques',
    author: 'Luandino Vieira',
    authorId: 'ZB-AUT-01',
    sellerId: 'ZB-SEL-01',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    priceAOA: 3500,
    priceUSD: 3.80,
    rating: 4.9,
    reviewCount: 142,
    category: 'Literatura Angolana',
    language: 'Português',
    pageCount: 198,
    publisher: 'Editora Chá de Caxinde / Zola Digital',
    publishedYear: 1964,
    isbn: '978-9722108781',
    description: 'Obra-prima da literatura angolana moderna. "Luuanda" reúne três estórias ("Vovó Xíxi e seu neto Zito", "Estória do ladrão e do papagaio" e "Estória da galinha e do ovo") ambientadas nos musseques da capital angolana, revelando a alma, o linguajar kimbundu-português e a dignidade do povo de Luanda.',
    isFeatured: true,
    isBestseller: true,
    isAngolanAuthor: true,
    isFree: false,
    isFlashSale: true,
    originalPriceAOA: 5000,
    originalPriceUSD: 5.40,
    discountPercentage: 30,
    flashSaleEndsAt: new Date(Date.now() + 14 * 3600 * 1000 + 28 * 60 * 1000).toISOString(),
    fileSizeMb: 4.2,
    tags: ['Angola', 'Luanda', 'Musseque', 'Clássico', 'Prémio Camões'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: O Mambas no Musseque',
          content: `Nos musseques de Luanda, a poeira avermelhada subia quando as crianças corriam atrás de uma bola de meias velhas. Vovó Xíxi olhava a kianda do poço e suspirava... "Meu filho, o tempo de hoje não traz chuva, traz história." O vento soprava vindo do Atlântico, trazendo o cheiro do peixe seco e do café fresco torrado na rua Direita da Samba.`
        },
        {
          title: 'Capítulo 2: A Galinha do vizinho',
          content: `A galinha da vizinha cabinda cacarejava no quintal de zinco. Zito contava os centavos de angolares para comprar o pão de farinha amarela na padaria do Seu Manuel. A sabedoria dos musseques mora no respeito aos mais velhos e no abraço que une a vizinhança.`
        }
      ]
    },
    fullContent: {
      chapters: [
        {
          title: 'Capítulo 1: O Mambas no Musseque',
          content: `Nos musseques de Luanda, a poeira avermelhada subia quando as crianças corriam atrás de uma bola de meias velhas. Vovó Xíxi olhava a kianda do poço e suspirava... "Meu filho, o tempo de hoje não traz chuva, traz história." O vento soprava vindo do Atlântico, trazendo o cheiro do peixe seco e do café fresco torrado na rua Direita da Samba.`
        },
        {
          title: 'Capítulo 2: A Galinha do vizinho',
          content: `A galinha da vizinha cabinda cacarejava no quintal de zinco. Zito contava os centavos de angolares para comprar o pão de farinha amarela na padaria do Seu Manuel. A sabedoria dos musseques mora no respeito aos mais velhos e no abraço que une a vizinhança.`
        },
        {
          title: 'Capítulo 3: As Manhãs da Maianga',
          content: `Ao despontar do sol na Maianga, os trabalhadores ajeitavam os chapéus de palha e subiam nos autocarros da roça. A resistência do povo angolano fez-se na poesia escrita nos muros e na esperança indomável trazida no peito.`
        },
        {
          title: 'Capítulo 4: Epílogo da Liberdade',
          content: `A paz e a literatura entrelaçam-se nas memórias das nossas avós. Zola Books orgulhosamente preserva e disponibiliza este património imaterial de Angola para o mundo inteiro.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-102',
    title: 'Mayombe',
    subtitle: 'Narrativa visceral sobre camaradagem, utopia e a floresta de Cabinda',
    author: 'Pepetela',
    authorId: 'ZB-AUT-02',
    sellerId: 'ZB-SEL-01',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    priceAOA: 4200,
    priceUSD: 4.50,
    rating: 4.8,
    reviewCount: 98,
    category: 'Literatura Angolana',
    language: 'Português',
    pageCount: 240,
    publisher: 'Editora Dom Quixote / Zola Digital',
    publishedYear: 1980,
    isbn: '978-9722022025',
    description: 'Um dos livros mais estudados e aclamados de Pepetela. Ambientado na densa floresta do Mayombe em Cabinda durante a luta de libertação nacional, o romance explora os conflitos psicológicos, éticos, étnicos e sociais dos guerrilheiros Sem Medo, Teoria, Comando e Milagre.',
    isFeatured: true,
    isBestseller: true,
    isAngolanAuthor: true,
    isFree: false,
    isFlashSale: true,
    originalPriceAOA: 6000,
    originalPriceUSD: 6.50,
    discountPercentage: 30,
    flashSaleEndsAt: new Date(Date.now() + 8 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
    fileSizeMb: 5.1,
    tags: ['Pepetela', 'Mayombe', 'Cabinda', 'História', 'Romance'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo I: A Floresta e o Homem',
          content: `O Mayombe é gigantesco e verdejante. As árvores seculares fecham o céu e a luz do sol filtra-se em raios dourados de esperança. Sem Medo caminhava na frente, sentindo a humidade do solo e a presença sagrada dos ancestrais da floresta.`
        }
      ]
    },
    fullContent: {
      chapters: [
        {
          title: 'Capítulo I: A Floresta e o Homem',
          content: `O Mayombe é gigantesco e verdejante. As árvores seculares fecham o céu e a luz do sol filtra-se em raios dourados de esperança. Sem Medo caminhava na frente, sentindo a humidade do solo e a presença sagrada dos ancestrais da floresta.`
        },
        {
          title: 'Capítulo II: O Diálogo com Teoria',
          content: `"Não lutamos apenas contra a opressão vinda de fora, lutamos para construir o angolano do amanhã", disse Teoria ajustando os óculos sob as folhagens do Mayombe.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-103',
    title: 'O Vendedor de Passados',
    subtitle: 'Inventando genealogias de glória na Luanda contemporânea',
    author: 'José Eduardo Agualusa',
    authorId: 'ZB-AUT-03',
    sellerId: 'ZB-SEL-02',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
    priceAOA: 4800,
    priceUSD: 5.20,
    rating: 4.9,
    reviewCount: 175,
    category: 'Ficção',
    language: 'Português',
    pageCount: 220,
    publisher: 'Língua Geral / Zola Digital',
    publishedYear: 2004,
    isbn: '978-8560160129',
    description: 'Félix Ventura vende passados falsos a diplomatas, empresários e à nova elite de Luanda que precisa de uma árvore genealógica aristocrática. Narrado por uma osga (lagartixa) com memória humana que habita a casa de Félix, esta sátira venceu o prestigiado Independent Foreign Fiction Prize.',
    isFeatured: true,
    isBestseller: true,
    isAngolanAuthor: true,
    isFree: false,
    fileSizeMb: 3.8,
    tags: ['Agualusa', 'Sátira', 'Luanda', 'Prémio Internacional', 'Ficção'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: A Memória da Lagartixa',
          content: `Eu sou uma osga. Habito o teto da sala de Félix Ventura. Assisto diariamente os generais e empresários que entram na casa a procurar um passado nobre com retratos a sépia e diários antigos do século XIX.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-104',
    title: 'Finanças Pessoais em Angola',
    subtitle: 'Como gerir salários, investir no mercado local e criar riqueza em Kwanzas',
    author: 'Mateus Kanhama',
    authorId: 'ZB-AUT-04',
    sellerId: 'ZB-SEL-02',
    coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80',
    priceAOA: 5000,
    priceUSD: 5.40,
    rating: 4.7,
    reviewCount: 84,
    category: 'Negócios & Finanças',
    language: 'Português',
    pageCount: 180,
    publisher: 'Editora KwanzaProsperity',
    publishedYear: 2025,
    isbn: '978-9891234567',
    description: 'O guia definitivo adaptado à realidade económica angolana. Aprenda a proteger o seu capital contra a inflação, investir em Obrigações do Tesouro (OTs), criar negócios rentáveis em Luanda e Benguela, e diversificar fontes de rendimento.',
    isFeatured: true,
    isBestseller: false,
    isAngolanAuthor: true,
    isFree: false,
    isNewRelease: true,
    fileSizeMb: 6.0,
    tags: ['Finanças', 'Kwanza', 'Angola', 'Investimento', 'BODIVA'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: O Desafio da Inflação e a Mentalidade Financeira',
          content: `Para alcançar a independência financeira em Angola, é fundamental entender a relação entre o Kwanza, as taxas de juro da BODIVA e o consumo consciente nos mercados formais e informais.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-105',
    title: 'Construindo Apps Modernos com React & Node.js',
    subtitle: 'Do Zero ao Deploy Global com Foco em Soluções Africanas',
    author: 'Kiala Mbala',
    authorId: 'ZB-AUT-05',
    sellerId: 'ZB-SEL-02',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    priceAOA: 6000,
    priceUSD: 6.50,
    rating: 5.0,
    reviewCount: 46,
    category: 'Tecnologia',
    language: 'Português',
    pageCount: 310,
    publisher: 'TechLuanda Press',
    publishedYear: 2026,
    isbn: '978-9899876543',
    description: 'Aprenda desenvolvimento web moderno construindo plataformas escaláveis como e-commerce, fintechs para pagamentos por Multicaixa Express e APIs RESTful em TypeScript com alta performance.',
    isFeatured: false,
    isBestseller: false,
    isAngolanAuthor: true,
    isFree: false,
    isNewRelease: true,
    fileSizeMb: 8.4,
    tags: ['Programação', 'React', 'Node.js', 'LuandaTech', 'TypeScript'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: Arquitetura de Software Scalable',
          content: `A engenharia de software no contexto emergente exige resiliência de rede, caching estratégico para utilizadores com conexões móveis e pagamentos seguros via gateways locais e globais.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-106',
    title: 'A Rainha Ginga e os Segredos do Ndongo',
    subtitle: 'Edição Ilustrada Infantil e Infanto-Juvenil',
    author: 'Nginga Ndombaxi',
    authorId: 'ZB-AUT-06',
    sellerId: 'ZB-SEL-01',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
    priceAOA: 0,
    priceUSD: 0,
    rating: 4.9,
    reviewCount: 210,
    category: 'E-books Gratuitos',
    language: 'Português',
    pageCount: 48,
    publisher: 'Zola Kids & Cultura',
    publishedYear: 2024,
    isbn: '978-9890001112',
    description: 'E-book educativo gratuito oferecido pela Zola Books para ensinar a todas as crianças e jovens a coragem, diplomacia e liderança da lendária Rainha Njinga Mbandi dos reinos do Ndongo e Matamba.',
    isFeatured: true,
    isBestseller: true,
    isAngolanAuthor: true,
    isFree: true,
    fileSizeMb: 12.0,
    tags: ['Infantil', 'Grátis', 'Rainha Ginga', 'História de Angola', 'Animação'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: A Menina de Sangue Nobre',
          content: `No palácio do Rei Mbandi, nasceu uma menina guerreira com os olhos brilhantes como o sol do Kwanza... Seu nome ficaria gravado na história de África para sempre.`
        }
      ]
    },
    fullContent: {
      chapters: [
        {
          title: 'Capítulo 1: A Menina de Sangue Nobre',
          content: `No palácio do Rei Mbandi, nasceu uma menina guerreira com os olhos brilhantes como o sol do Kwanza... Seu nome ficaria gravado na história de África para sempre. Desde tenra idade, Njinga aprendeu a montar cavalos, manusear o arco e as flechas e a compreender a diplomacia com os emissários do além-mar.`
        },
        {
          title: 'Capítulo 2: A Cadeira da Rainha',
          content: `Na famosa reunião com o governador português em Luanda, não havia cadeira para ela se sentar. Sem hesitar, uma de suas damas de companhia ajoelhou-se para que a nobre soberana se sentasse com dignidade real, demonstrando ao mundo que o Ndongo jamais se curvaria.`
        },
        {
          title: 'Capítulo 3: O Legado Eterno para as Crianças de Angola',
          content: `A coragem e inteligência da Rainha Njinga inspiram gerações de meninas e meninos angolanos a defender a sua cultura, valorizar os estudos e construir um futuro brilhante com orgulho da nossa herança ancestral.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-114',
    title: 'Contos e Provérbios de Sabedoria de Angola',
    subtitle: 'Narrativas orais, fábulas do embondeiro e lições dos mais velhos',
    author: 'Esperança Luísa & Coletivo Zola',
    authorId: 'ZB-AUT-10',
    sellerId: 'ZB-SEL-01',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80',
    priceAOA: 0,
    priceUSD: 0,
    rating: 5.0,
    reviewCount: 188,
    category: 'E-books Gratuitos',
    language: 'Português',
    pageCount: 84,
    publisher: 'Edições Zola Cultura Aberta',
    publishedYear: 2026,
    isbn: '978-9890002223',
    description: 'Uma antologia cultural inteiramente gratuita para toda a comunidade Zola Books. Reúne contos populares passados de geração em geração à volta da fogueira, lendas sobre a Kianda e provérbios tradicionais com tradução e contexto cultural.',
    isFeatured: true,
    isBestseller: true,
    isAngolanAuthor: true,
    isFree: true,
    fileSizeMb: 3.5,
    tags: ['Cultura', 'Grátis', 'Contos', 'Provérbios', 'Angola', 'Tradição Oral'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: O Coelho Esperto e o Elefante',
          content: `Na savana de Malanje, diziam os antigos que o tamanho não define a sabedoria. O pequeno coelho ensinou ao grande elefante que a paciência e a astúcia superam a força bruta...`
        }
      ]
    },
    fullContent: {
      chapters: [
        {
          title: 'Capítulo 1: O Coelho Esperto e o Elefante',
          content: `Na savana de Malanje, diziam os antigos que o tamanho não define a sabedoria. O pequeno coelho ensinou ao grande elefante que a paciência e a astúcia superam a força bruta. Quando a seca chegou, os animais reuniram-se sob o embondeiro sagrado para encontrar água.`
        },
        {
          title: 'Capítulo 2: A Lenda da Kianda e a Baía de Luanda',
          content: `Os pescadores da Ilha de Luanda sabiam que para pescar em paz era preciso respeitar as águas da Kianda, a divindade guardiã do mar. Quem cuida da natureza e partilha o peixe com o vizinho recebe em dobro a bênção das marés.`
        },
        {
          title: 'Capítulo 3: Provérbios em Kimbundu e Português',
          content: `«Mukua ngolo kalé ni kitadi, mukua manhinga uala ni muenhu» — Aquele que tem saúde e honra possui a maior riqueza da vida. A verdadeira nobreza está na humildade e no respeito aos antepassados.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-107',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    subtitle: 'High Performance Development Practices',
    author: 'Robert C. Martin',
    authorId: 'ZB-AUT-07',
    sellerId: 'ZB-SEL-03',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    priceAOA: 8500,
    priceUSD: 9.10,
    rating: 4.9,
    reviewCount: 320,
    category: 'Tecnologia',
    language: 'Inglês',
    pageCount: 464,
    publisher: 'Prentice Hall / Zola Global',
    publishedYear: 2008,
    isbn: '978-0132350884',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. Learn the best refactoring principles.',
    isFeatured: false,
    isBestseller: true,
    isAngolanAuthor: false,
    isFree: false,
    fileSizeMb: 7.2,
    tags: ['Software', 'CleanCode', 'Architecture', 'English'],
    sampleContent: {
      chapters: [
        {
          title: 'Chapter 1: Clean Code Principles',
          content: `Write code for humans first, computers second. Names should reveal intent. Functions should be small and do one thing exceptionally well.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-108',
    title: 'Poemas de Amor e Liberdade do Kwanza',
    subtitle: 'Coletânea da Nova Poesia Angolana',
    author: 'Ondjaki & Novos Poetas',
    authorId: 'ZB-AUT-08',
    sellerId: 'ZB-SEL-01',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80',
    priceAOA: 2500,
    priceUSD: 2.70,
    rating: 4.8,
    reviewCount: 65,
    category: 'Poesia',
    language: 'Português',
    pageCount: 110,
    publisher: 'Editora Nzila',
    publishedYear: 2025,
    isbn: '978-9898887771',
    description: 'Uma antologia Poética que canta as tardes de cacimbo, os abraços na ilha do Cabo, o aroma do múcua e os sonhos da juventude angolana no século XXI.',
    isFeatured: false,
    isBestseller: false,
    isAngolanAuthor: true,
    isFree: false,
    fileSizeMb: 2.8,
    tags: ['Poesia', 'Ondjaki', 'Luanda', 'Cultura', 'Cacimbo'],
    sampleContent: {
      chapters: [
        {
          title: 'Poema I: O Cacimbo em Luanda',
          content: `Vem o cacimbo sereno / vestir a baía de cinza leve / e no peito do poeta angolano / o amor transborda em verso suave.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-109',
    title: 'As Crónicas de Luanda 2088: Sol de Cóbalto',
    subtitle: 'Romance Afrofuturista de Ficção Científica na Baía de Luanda',
    author: 'Samba Nsingi',
    authorId: 'ZB-AUT-09',
    sellerId: 'ZB-SEL-02',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    priceAOA: 4000,
    priceUSD: 4.30,
    rating: 4.9,
    reviewCount: 78,
    category: 'Ficção',
    language: 'Português',
    pageCount: 280,
    publisher: 'Editora Futuro Kuito / Zola Digital',
    publishedYear: 2026,
    isbn: '978-9899000123',
    description: 'No ano de 2088, a Baía de Luanda é iluminada por arranha-céus solares e inteligências artificiais com consciência ancestral Kimbundu. Uma hacker angolana descobre um algoritmo secreto escondido no fundo do oceano Atlântico capaz de prever o futuro da África Subsaariana.',
    isFeatured: true,
    isBestseller: true,
    isAngolanAuthor: true,
    isFree: false,
    isNewRelease: true,
    fileSizeMb: 5.4,
    tags: ['Ficção Científica Africana', 'Afrofuturismo', 'Luanda', 'Tecnologia', 'Ficção'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: O Neve de Sol no Mussulo',
          content: `Os drones de entrega voavam em formação perfeita sobre as palmeiras cibernéticas da Ilha do Mussulo. Nzinga olhava para o holograma na sua retina e ouvia a voz sintetizada do ancestral Nginga...`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-110',
    title: 'A Arte da Focagem e Autodisciplina Angolana',
    subtitle: 'Guia de Elevação Pessoal, Mente Forte e Resiliência em Tempos de Mudança',
    author: 'Doutora Kiamembua Bento',
    authorId: 'ZB-AUT-10',
    sellerId: 'ZB-SEL-02',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    priceAOA: 3800,
    priceUSD: 4.10,
    rating: 4.8,
    reviewCount: 112,
    category: 'Não-Ficção',
    language: 'Português',
    pageCount: 195,
    publisher: 'Editora Mente Aberta Luanda',
    publishedYear: 2025,
    isbn: '978-9899000456',
    description: 'Um bestseller inspirador de desenvolvimento pessoal adaptado ao dia a dia angolano. Métodos práticos para superar o cansaço, gerir hábitos diários, cultivar inteligência emocional e atingir objetivos pessoais com determinação.',
    isFeatured: true,
    isBestseller: true,
    isAngolanAuthor: true,
    isFree: false,
    fileSizeMb: 4.1,
    tags: ['Autoajuda', 'Desenvolvimento Pessoal', 'Produtividade', 'Sucesso', 'Mindset'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: A Força Interior e o Poder das Escolhas Diárias',
          content: `A verdadeira autodisciplina não nasce do sacrifício sem propósito, mas sim da clareza sobre quem queres ser no teu país e no teu lar. Todos os dias ao acordares em Luanda ou no Huambo, tens a oportunidade de redesenhar a tua história.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-111',
    title: 'Nós, os do Makulusu',
    subtitle: 'Um retrato lírico das vivências e memórias do bairro Makulusu',
    author: 'Luandino Vieira',
    authorId: 'ZB-AUT-01',
    sellerId: 'ZB-SEL-01',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    priceAOA: 3800,
    priceUSD: 4.10,
    rating: 4.8,
    reviewCount: 94,
    category: 'Literatura Angolana',
    language: 'Português',
    pageCount: 210,
    publisher: 'Editora Chá de Caxinde / Zola Digital',
    publishedYear: 1974,
    isbn: '978-9722108798',
    description: 'Considerada uma das obras estilisticamente mais ousadas e poéticas da literatura angolana. O narrador evoca a infância e juventude no bairro do Makulusu em Luanda, abordando as amizades de infância separadas pelos caminhos da história e da revolução.',
    isFeatured: true,
    isBestseller: false,
    isAngolanAuthor: true,
    isFree: false,
    fileSizeMb: 4.5,
    tags: ['Luandino Vieira', 'Makulusu', 'Luanda', 'Literatura Angolana', 'Clássico'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: O Vento do Makulusu',
          content: `No Makulusu a poeira dança com as sombras das acácias. Lembro-me do Maninho, do Ti Chico e do riso das moças ao fim da tarde...`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-112',
    title: 'A Geração da Utopia',
    subtitle: 'Romance monumental sobre os dilemas e os sonhos de uma época',
    author: 'Pepetela',
    authorId: 'ZB-AUT-02',
    sellerId: 'ZB-SEL-01',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    priceAOA: 4500,
    priceUSD: 4.80,
    rating: 4.9,
    reviewCount: 128,
    category: 'Literatura Angolana',
    language: 'Português',
    pageCount: 340,
    publisher: 'Editora Dom Quixote / Zola Digital',
    publishedYear: 1992,
    isbn: '978-9722022032',
    description: 'A Geração da Utopia divide-se em quatro partes e acompanha quatro jovens intelectuais angolanos desde a Casa dos Estudantes do Império em Lisboa nos anos 60 até ao pós-independência em Luanda.',
    isFeatured: true,
    isBestseller: true,
    isAngolanAuthor: true,
    isFree: false,
    fileSizeMb: 5.8,
    tags: ['Pepetela', 'Utopia', 'História', 'Literatura Angolana', 'Romance'],
    sampleContent: {
      chapters: [
        {
          title: 'Parte I: A Casa dos Estudantes',
          content: `Em Lisboa os ventos frios do Atlântico reuniam os jovens estudantes das colónias na célebre Casa. Sonhava-se com uma África livre, justa e renovada.`
        }
      ]
    }
  },
  {
    id: 'ZB-BK-113',
    title: 'Teoria Geral do Esquecimento',
    subtitle: 'Vencedor do International DUBLIN Literary Award',
    author: 'José Eduardo Agualusa',
    authorId: 'ZB-AUT-03',
    sellerId: 'ZB-SEL-02',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    priceAOA: 4900,
    priceUSD: 5.30,
    rating: 5.0,
    reviewCount: 192,
    category: 'Ficção',
    language: 'Português',
    pageCount: 232,
    publisher: 'Dom Quixote / Zola Digital',
    publishedYear: 2012,
    isbn: '978-9722049879',
    description: 'Na véspera da independência de Angola, Ludo ergue uma parede de alvenaria a isolar o seu apartamento em Luanda e ali vive confinada durante trinta anos, sobrevivendo com o que cultiva no terraço e observando o mundo exterior através da janela.',
    isFeatured: true,
    isBestseller: true,
    isAngolanAuthor: true,
    isFree: false,
    fileSizeMb: 4.0,
    tags: ['Agualusa', 'Prémio Dublin', 'Luanda', 'Ficção', 'Literatura Angolana'],
    sampleContent: {
      chapters: [
        {
          title: 'Capítulo 1: O Muro de Alvenaria',
          content: `Ludo ergueu o muro tijolo a tijolo. Do outro lado da parede ferveu a independência, as transformações e o renascimento de uma nação.`
        }
      ]
    }
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'ZB-USR-001',
    name: 'Abdul Aziz Senê Angolano',
    email: 'aseneangolano@gmail.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+244 922 255 648',
    country: 'Angola',
    affiliateCode: 'ABDUL2026',
    affiliateEarningsAOA: 45000,
    affiliateEarningsUSD: 48.50,
    purchasedBookIds: ['ZB-BK-101', 'ZB-BK-102', 'ZB-BK-104', 'ZB-BK-106'],
    favoriteBookIds: ['ZB-BK-101', 'ZB-BK-103', 'ZB-BK-105'],
    dailyReminderSettings: {
      enabled: true,
      time: '20:00',
      goalMinutes: 20,
      customMessage: 'A tua mente agradece! Reserve 20 minutos para a tua leitura de hoje na Zola Books 🇦🇴',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      pushNotificationsEnabled: true,
      soundEnabled: true
    },
    createdAt: '2026-01-15'
  },
  {
    id: 'ZB-USR-002',
    name: 'Esperança Luísa',
    email: 'esperanca.autor@zolabooks.ao',
    role: 'author',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    phone: '+244 912 987 654',
    country: 'Angola',
    affiliateCode: 'ESPERANCA10',
    affiliateEarningsAOA: 12000,
    affiliateEarningsUSD: 12.90,
    purchasedBookIds: ['ZB-BK-103', 'ZB-BK-106'],
    favoriteBookIds: ['ZB-BK-102'],
    createdAt: '2026-02-01'
  },
  {
    id: 'ZB-USR-003',
    name: 'Editora Chá de Caxinde',
    email: 'vendas@chadecaxinde.ao',
    role: 'seller',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    phone: '+244 944 112 233',
    country: 'Angola',
    affiliateCode: 'CAXINDE',
    affiliateEarningsAOA: 89000,
    affiliateEarningsUSD: 95.00,
    purchasedBookIds: ['ZB-BK-105'],
    favoriteBookIds: ['ZB-BK-101', 'ZB-BK-104'],
    createdAt: '2026-01-10'
  },
  {
    id: 'ZB-USR-004',
    name: 'John Miller (Leitor Internacional)',
    email: 'john.reader@globalbooks.com',
    role: 'customer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '+1 415 555 0199',
    country: 'United States',
    affiliateCode: 'JOHNUSA',
    affiliateEarningsAOA: 0,
    affiliateEarningsUSD: 0,
    purchasedBookIds: ['ZB-BK-101', 'ZB-BK-107'],
    favoriteBookIds: ['ZB-BK-101'],
    createdAt: '2026-03-01'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'ZB-CPN-01',
    code: 'BENVINDO10',
    discountPercentage: 10,
    minAmountAOA: 3000,
    validUntil: '2026-12-31',
    usageCount: 142,
    active: true
  },
  {
    id: 'ZB-CPN-02',
    code: 'ANGOLA2026',
    discountPercentage: 15,
    minAmountAOA: 4000,
    validUntil: '2026-12-31',
    usageCount: 89,
    active: true
  },
  {
    id: 'ZB-CPN-03',
    code: 'LEITORAFRICA',
    discountPercentage: 20,
    minAmountAOA: 8000,
    validUntil: '2026-11-30',
    usageCount: 35,
    active: true
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'ZB-REV-101',
    bookId: 'ZB-BK-101',
    userName: 'Kalandula Neto',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    comment: 'Luuanda é a alma da nossa terra! A facilidade de comprar em Kwanzas por Multicaixa Express e descarregar o e-book na hora aqui no portal Zola é fenomenal.',
    date: '2026-07-28',
    verifiedBuyer: true,
    likes: 18
  },
  {
    id: 'ZB-REV-102',
    bookId: 'ZB-BK-101',
    userName: 'Maria Inês (Lisboa)',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    comment: 'Comprei a partir de Portugal usando cartão de crédito em Euros. O leitor digital integrado na biblioteca do Zola Books é super fluido e a tradução do glossário kimbundu ajuda muito!',
    date: '2026-08-02',
    verifiedBuyer: true,
    likes: 12
  },
  {
    id: 'ZB-REV-103',
    bookId: 'ZB-BK-104',
    userName: 'Sérgio Manuel',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    comment: 'Livro prático sobre finanças com exemplos reais das taxas de câmbio de Luanda e investimentos em OT. Recomendo muito!',
    date: '2026-08-04',
    verifiedBuyer: true,
    likes: 9
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ZB-ORD-9001',
    userId: 'ZB-USR-001',
    userName: 'Abdul Aziz Senê Angolano',
    userEmail: 'aseneangolano@gmail.com',
    items: [
      { bookId: 'ZB-BK-101', bookTitle: 'Luuanda', price: 3500, currency: 'AOA' },
      { bookId: 'ZB-BK-102', bookTitle: 'Mayombe', price: 4200, currency: 'AOA' }
    ],
    totalAOA: 7700,
    totalUSD: 8.28,
    currencyPaid: 'AOA',
    amountPaid: 7700,
    paymentMethod: 'multicaixa_express',
    paymentStatus: 'completed',
    paymentReference: 'MCX-8829102-AO',
    couponApplied: 'BENVINDO10',
    discountAmount: 770,
    createdAt: '2026-08-01 14:30',
    downloadToken: 'TOK-998821'
  },
  {
    id: 'ZB-ORD-9002',
    userId: 'ZB-USR-004',
    userName: 'John Miller',
    userEmail: 'john.reader@globalbooks.com',
    items: [
      { bookId: 'ZB-BK-101', bookTitle: 'Luuanda', price: 3.80, currency: 'USD' }
    ],
    totalAOA: 3534,
    totalUSD: 3.80,
    currencyPaid: 'USD',
    amountPaid: 3.80,
    paymentMethod: 'stripe_card',
    paymentStatus: 'completed',
    paymentReference: 'ch_3M482910291',
    discountAmount: 0,
    createdAt: '2026-08-03 09:15',
    downloadToken: 'TOK-112233'
  }
];

export const INITIAL_SELLER_SALES: SellerSaleNotification[] = [
  {
    id: 'SALE-NOTIF-101',
    orderId: 'ZB-ORD-9001',
    bookId: 'ZB-BK-101',
    bookTitle: 'Luuanda',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    author: 'Luandino Vieira',
    sellerId: 'ZB-SEL-01',
    sellerName: 'Editora Chá de Caxinde / Zola Digital',
    amountAOA: 3500,
    amountUSD: 3.80,
    currencyPaid: 'AOA',
    amountPaid: 3500,
    buyerName: 'Abdul Aziz Senê Angolano',
    buyerEmail: 'aseneangolano@gmail.com',
    date: '01/08/2026',
    time: '14:30',
    timestamp: '2026-08-01T14:30:00Z',
    paymentMethod: 'multicaixa_express',
    paymentStatus: 'completed',
    paymentReference: 'MCX-8829102-AO',
    read: true,
    notifiedAt: '2026-08-01T14:30:00Z'
  },
  {
    id: 'SALE-NOTIF-102',
    orderId: 'ZB-ORD-9001',
    bookId: 'ZB-BK-102',
    bookTitle: 'Mayombe',
    bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    author: 'Pepetela',
    sellerId: 'ZB-SEL-01',
    sellerName: 'Editora Chá de Caxinde / Zola Digital',
    amountAOA: 4200,
    amountUSD: 4.50,
    currencyPaid: 'AOA',
    amountPaid: 4200,
    buyerName: 'Abdul Aziz Senê Angolano',
    buyerEmail: 'aseneangolano@gmail.com',
    date: '01/08/2026',
    time: '14:30',
    timestamp: '2026-08-01T14:30:00Z',
    paymentMethod: 'multicaixa_express',
    paymentStatus: 'completed',
    paymentReference: 'MCX-8829102-AO',
    read: true,
    notifiedAt: '2026-08-01T14:30:00Z'
  },
  {
    id: 'SALE-NOTIF-103',
    orderId: 'ZB-ORD-9002',
    bookId: 'ZB-BK-101',
    bookTitle: 'Luuanda',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    author: 'Luandino Vieira',
    sellerId: 'ZB-SEL-01',
    sellerName: 'Editora Chá de Caxinde / Zola Digital',
    amountAOA: 3534,
    amountUSD: 3.80,
    currencyPaid: 'USD',
    amountPaid: 3.80,
    buyerName: 'John Miller',
    buyerEmail: 'john.reader@globalbooks.com',
    date: '03/08/2026',
    time: '09:15',
    timestamp: '2026-08-03T09:15:00Z',
    paymentMethod: 'stripe_card',
    paymentStatus: 'completed',
    paymentReference: 'ch_3M482910291',
    read: false,
    notifiedAt: '2026-08-03T09:15:00Z'
  }
];
