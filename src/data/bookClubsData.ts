import { BookClub } from '../types';

export const INITIAL_BOOK_CLUBS: BookClub[] = [
  {
    id: 'club-angolan-lit',
    name: 'Clube da Literatura Angolana',
    tagline: 'Explorando clássicos e novas vozes da literatura de Angola',
    description: 'Um espaço vibrante e dedicado para leitores debaterem o património literário angolano — desde Luandino Vieira, Agostinho Neto e Pepetela até aos autores contemporâneos de Luanda, Benguela e Huambo.',
    type: 'genre',
    targetCategoryOrAuthor: 'Literatura Angolana',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    avatarIcon: '🇦🇴',
    membersCount: 342,
    isJoined: true,
    currentBookId: 'ZB-BK-101', // Luuanda
    meetingSchedule: 'Todas as Sextas às 18:30 (Horário de Luanda / GMT+1)',
    tags: ['Angola', 'Luandino', 'Musseques', 'Tradição Oral', 'Identidade'],
    moderatorName: 'Dra. Kalandula Mendes',
    moderatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    discussions: [
      {
        id: 'disc-101',
        clubId: 'club-angolan-lit',
        authorName: 'Dra. Kalandula Mendes',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Moderador',
        title: '📌 Debate do Mês: A Linguagem Kimbundu-Português nas Estórias de "Luuanda"',
        content: 'Como é que Luandino Vieira consegue reinventar a língua portuguesa integrando os ritmos, metáforas e provérbios do Kimbundu dos musseques? Que impacto isso teve na literatura angolana pós-colonial?',
        bookId: 'ZB-BK-101',
        chapterRef: 'Capítulo 1 & 2',
        date: 'Ontem às 16:40',
        likes: 24,
        likedByCurrentUser: true,
        isPinned: true,
        comments: [
          {
            id: 'comm-1',
            authorName: 'Mateus Nzaji',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
            authorRole: 'Leitor',
            text: 'A forma como a Vovó Xíxi fala reflete exatamente a sabedoria popular dos bairros tradicionais de Luanda! É uma obra que dignifica a oralidade.',
            date: 'Há 5 horas',
            likes: 8
          },
          {
            id: 'comm-2',
            authorName: 'Zola IA',
            authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
            authorRole: 'Zola IA',
            text: 'Curiosidade Literária: "Luuanda" foi escrito na Prisão do Tarrafal em 1963. A obra venceu o Prémio da Sociedade Portuguesa de Escritores em 1965, gerando enorme repercussão internacional.',
            date: 'Há 3 horas',
            likes: 15
          }
        ]
      },
      {
        id: 'disc-102',
        clubId: 'club-angolan-lit',
        authorName: 'Esperança Manuel',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Leitor',
        title: 'A solidariedade comunitária no conto "Estória da Galinha e do Ovo"',
        content: 'Repararam como a disputa por um ovo traz à tona toda a estrutura de justiça comunitária e fraternidade no musseque? Ninguém passa fome sozinho quando a comunidade está unida.',
        bookId: 'ZB-BK-101',
        chapterRef: 'Estória 3',
        date: 'Hoje às 10:15',
        likes: 11,
        comments: []
      }
    ]
  },
  {
    id: 'club-agualusa',
    name: 'Clube de Leitura Agualusa',
    tagline: 'Memória, realismo mágico e viagens pelas geografias da Lusofonia',
    description: 'Grupo dedicado às obras do aclamado autor angolano José Eduardo Agualusa. Discutimos temas de memória histórica, identidade, invenção do passado e amor.',
    type: 'author',
    targetCategoryOrAuthor: 'José Eduardo Agualusa',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1200&q=80',
    avatarIcon: '🦎',
    membersCount: 218,
    isJoined: false,
    currentBookId: 'ZB-BK-103', // O Vendedor de Passados
    meetingSchedule: 'Aos Sábados às 17:00',
    tags: ['Agualusa', 'Sátira', 'Memória', 'Ficção', 'Romance'],
    moderatorName: 'Prof. Aníbal de Lemos',
    moderatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    discussions: [
      {
        id: 'disc-201',
        clubId: 'club-agualusa',
        authorName: 'Prof. Aníbal de Lemos',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Moderador',
        title: '📌 Por que a voz narrativa de uma osga (lagartixa) em "O Vendedor de Passados"?',
        content: 'A escolha de uma osga com memória humana como narrador é um golpe de mestre de Agualusa. Ela observa sem ser notada. Que efeito isso provoca na forma como percebemos a elite de Luanda?',
        bookId: 'ZB-BK-103',
        chapterRef: 'Introdução & Capítulo 1',
        date: 'Há 2 dias',
        likes: 19,
        isPinned: true,
        comments: [
          {
            id: 'comm-201',
            authorName: 'Teresa Cabral',
            authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
            authorRole: 'Leitor',
            text: 'Dá um tom irónico fantástico! A osga tem mais ética do que muitos humanos que compram genealogias falsas.',
            date: 'Há 1 dia',
            likes: 6
          }
        ]
      }
    ]
  },
  {
    id: 'club-pepetela',
    name: 'Clube História & Utopia — Pepetela',
    tagline: 'Análise profunda dos romances históricos e sociopolíticos de Pepetela',
    description: 'Encontros literários focados na vasta bibliografia do Prémio Camões Pepetela. Debatemos "Mayombe", "A Geração da Utopia", "O Desejo de Kianda" e "A Jiboia".',
    type: 'author',
    targetCategoryOrAuthor: 'Pepetela',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    avatarIcon: '🌳',
    membersCount: 185,
    isJoined: false,
    currentBookId: 'ZB-BK-102', // Mayombe
    meetingSchedule: 'Quinzenalmente aos Domingos às 16:00',
    tags: ['Pepetela', 'Mayombe', 'Cabinda', 'História', 'Sociedade'],
    moderatorName: 'Dr. Afonso Burity',
    moderatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    discussions: [
      {
        id: 'disc-301',
        clubId: 'club-pepetela',
        authorName: 'Dr. Afonso Burity',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Moderador',
        title: '📌 O dilema entre o indivíduo e a causa em "Mayombe"',
        content: 'O comandante Sem Medo personifica a lucidez crítica dentro da luta. Como o romance equilibra o heroísmo ideológico com as fragilidades humanas e éticas dos guerrilheiros?',
        bookId: 'ZB-BK-102',
        chapterRef: 'Capítulo I & II',
        date: 'Há 3 dias',
        likes: 31,
        isPinned: true,
        comments: []
      }
    ]
  },
  {
    id: 'club-business-tech',
    name: 'Clube Negócios & Inovação Africana',
    tagline: 'Empreendedorismo, economia, startups e tecnologia no contexto de Angola',
    description: 'Para leitores interessados em finanças pessoais, mercados emergentes, liderança e inovação tecnológica em África. Discussões práticas sobre livros de negócios.',
    type: 'genre',
    targetCategoryOrAuthor: 'Negócios & Finanças',
    coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    avatarIcon: '💼',
    membersCount: 290,
    isJoined: true,
    currentBookId: 'ZB-BK-105', // Exemplo de livro de negócios / tecnologia
    meetingSchedule: 'Todas as Terças às 20:00',
    tags: ['Negócios', 'Finanças', 'Angola', 'Inovação', 'Carreira'],
    moderatorName: 'Eng. Hélio Costa',
    moderatorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    discussions: [
      {
        id: 'disc-401',
        clubId: 'club-business-tech',
        authorName: 'Eng. Hélio Costa',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Moderador',
        title: '📌 Como aplicar estratégias digitais no mercado informal e formal angolano',
        content: 'Quais são os maiores obstáculos de pagamentos digitais e logística que as startups enfrentam em Luanda e no interior do país? Como superar com tecnologia local?',
        date: 'Há 4 dias',
        likes: 28,
        isPinned: true,
        comments: [
          {
            id: 'comm-401',
            authorName: 'Valdemar Neto',
            authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
            authorRole: 'Leitor',
            text: 'Soluções como Multicaixa Express e integração com código QR revolucionaram as vendas no nosso mercado.',
            date: 'Há 2 dias',
            likes: 12
          }
        ]
      }
    ]
  },
  {
    id: 'club-poesia-prosas',
    name: 'Clube Versos & Poesia Musseque',
    tagline: 'Lendo e recitando poesia angolana, lírica e lusófona',
    description: 'Um refúgio para amantes de poesia, métrica livre, slam e declamação. Celebramos Agostinho Neto, Paula Tavares, Lopito Feijóo e poetas emergentes.',
    type: 'genre',
    targetCategoryOrAuthor: 'Poesia',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80',
    avatarIcon: '📜',
    membersCount: 160,
    isJoined: false,
    currentBookId: 'ZB-BK-106',
    meetingSchedule: 'Aos Sábados às 21:00 (Noites de Sarau)',
    tags: ['Poesia', 'Versos', 'Agostinho Neto', 'Sarau', 'Declamação'],
    moderatorName: 'Nzalambi Poeta',
    moderatorAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
    discussions: [
      {
        id: 'disc-501',
        clubId: 'club-poesia-prosas',
        authorName: 'Nzalambi Poeta',
        authorAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Moderador',
        title: '📌 "Sagrada Esperança": A força lírica e política da poesia de Agostinho Neto',
        content: 'Partilhem aqui os vossos poemas favoritos de "Sagrada Esperança". Qual o verso que mais vos toca no peito quando pensam na nossa terra?',
        date: 'Há 1 semana',
        likes: 42,
        isPinned: true,
        comments: []
      }
    ]
  }
];
