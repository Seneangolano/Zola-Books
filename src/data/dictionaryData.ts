export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  category: string; // e.g. "Substantivo Masculino", "Adjetivo", "Regionalismo de Angola"
  definition: string;
  culturalNote?: string;
  synonyms: string[];
  antonyms?: string[];
  etymology?: string;
  example: string;
}

export const LOCAL_DICTIONARY: Record<string, DictionaryEntry> = {
  'muceque': {
    word: 'muceque',
    phonetic: '[mu·ce·que]',
    category: 'Substantivo Masculino (Regionalismo de Angola)',
    definition: 'Bairro periférico ou suburbano das cidades angolanas (especialmente Luanda); área comunitária popular de grande riqueza cultural e vivacidade social.',
    culturalNote: 'Elemento icónico na literatura angolana contemporânea e clássica (obras de Luandino Vieira e Pepetela).',
    synonyms: ['bairro popular', "subúrbio", 'comunidade', 'periferia'],
    antonyms: ['asfalto', 'centro urbano'],
    etymology: 'Do Kimbundu "musseke" (terreno arenoso ou lavoura).',
    example: 'Os candongueiros transitavam pelas ruas de terra do muceque ao entardecer em Luanda.'
  },
  'mayombe': {
    word: 'mayombe',
    phonetic: '[ma·yom·be]',
    category: 'Substantivo Próprio / Nome Geográfico',
    definition: 'Vasta e densa floresta tropical localizada na província de Cabinda, Angola. Na literatura, simboliza a resistência, a força da natureza e o refúgio da liberdade.',
    culturalNote: 'Título do celebre romance de Pepetela (1980) que retrata os guerrilheiros e a reflexão filosófica sobre a identidade angolana.',
    synonyms: ['floresta tropical', 'mata densa', 'selva de Cabinda'],
    etymology: 'Topónimo bantu de Cabinda.',
    example: 'O nevoeiro denso do Mayombe cobria as copas das árvores centenárias ao alvorecer.'
  },
  'kaluanda': {
    word: 'kaluanda',
    phonetic: '[ka·lu·an·da]',
    category: 'Substantivo / Adjetivo (Angolanismo)',
    definition: 'Habitante natural ou residente característico de Luanda; pessoa com espírito luandense, perspicácia e vivacidade urbana.',
    culturalNote: 'Expressão de orgulho cultural presente na poesia angolana e nas canções tradicionais de semba.',
    synonyms: ['luandense', 'filho de Luanda', 'habitué da baía'],
    etymology: 'Do prefixo diminutivo/afetuoso "ka-" com "Luanda".',
    example: 'Como bom kaluanda, conhecia cada beco da cidade e a brisa fresca da Ilha do Mussulo.'
  },
  'cacimba': {
    word: 'cacimba',
    phonetic: '[ca·cim·ba]',
    category: 'Substantivo Feminino',
    definition: '1. Nevoeiro húmido e denso, matinal ou noturno, muito comum nas regiões tropicais angolanas. 2. Poço pequeno ou cova feita na terra para recolher água limpa.',
    culturalNote: 'Figura poética recorrente para descrever as madrugadas de Luanda e do planalto central angolano.',
    synonyms: ['nevoeiro', 'orvalho', 'bruma', 'neblina', 'poço de água'],
    antonyms: ['sol abrasador', 'seca'],
    etymology: 'Do Kimbundu "kasimba".',
    example: 'A cacimba da madrugada cobria a Baía de Luanda antes de o sol do Equador despontar.'
  },
  'semba': {
    word: 'semba',
    phonetic: '[sem·ba]',
    category: 'Substantivo Masculino',
    definition: 'Gênero musical e dança tradicional angolana caracterizada por ritmo alegre, elegância de movimentos, umbigada e forte narrativa social.',
    culturalNote: 'Património cultural imaterial de Angola, matriz ritmática que influenciou o samba e o kizomba.',
    synonyms: ['dança angolana', 'ritmo tradicional', 'música de Luanda'],
    etymology: 'Do Kimbundu "massemba" (umbigada).',
    example: 'Os acordes da guitarra ritmada do semba ecoavam pelo salão de festas na Sambizanga.'
  },
  'bessangana': {
    word: 'bessangana',
    phonetic: '[bes·san·ga·na]',
    category: 'Substantivo Feminino (Termo Cultural)',
    definition: 'Mulher luandense tradicional vestida com trajes de panos sobrepostos, xaile e lenço na cabeça, símbolo de dignidade, nobreza e matronagem angolana.',
    culturalNote: 'Figura central da história social de Luanda, guardiã dos costumes e valores da tradição Kimbundu.',
    synonyms: ['dama luandense', 'matrona tradicional', 'senhora de panos'],
    etymology: 'Do Kimbundu "mubessangana".',
    example: 'A bessangana caminhava com elegância majestosa pela marginal, envergando os seus panos vistosos.'
  },
  'saudade': {
    word: 'saudade',
    phonetic: '[sau·da·de]',
    category: 'Substantivo Feminino',
    definition: 'Sentimento melancólico e afetuoso provocado pela ausência ou distância de uma pessoa, lugar, tempo ou experiência querida.',
    culturalNote: 'Conceito poético fundamental na literatura de língua portuguesa e na lusofonia universal.',
    synonyms: ['nostalgia', 'lembrança', 'Afeição', 'desejo', 'mágua suave'],
    antonyms: ['esquecimento', 'indiferença'],
    etymology: 'Do latim "solitatem" (solidão) fundido com "salutare".',
    example: 'A saudade da terra natal transbordava nos versos nostálgicos do poema.'
  },
  'resiliência': {
    word: 'resiliência',
    phonetic: '[re·si·li·ên·cia]',
    category: 'Substantivo Feminino',
    definition: 'Capacidade de superar adversidades, adaptar-se a mudanças e recuperar a força interior perante dificuldades.',
    culturalNote: 'Virtude central associada ao espírito do povo angolano ao longo da sua história e reconstrução.',
    synonyms: ['tenacidade', 'firmeza', 'persistência', 'superação', 'força moral'],
    antonyms: ['fragilidade', 'vulnerabilidade', 'desistência'],
    etymology: 'Do latim "resilire" (saltar para trás, voltar ao estado original).',
    example: 'A resiliência das mães angolanas garante o sustento e a educação de gerações.'
  },
  'afrofuturismo': {
    word: 'afrofuturismo',
    phonetic: '[a·fro·fu·tu·ris·mo]',
    category: 'Substantivo Masculino (Estética Literária)',
    definition: 'Movimento cultural e literário que combina ficção científica, tecnologia avançada, ancestralidade africana e mitologia para reimaginar o futuro do continente africano.',
    culturalNote: 'Gênero em forte expansão em Angola com obras como "As Crónicas de Luanda 2088".',
    synonyms: ['ficção científica africana', 'futurismo negro', 'cyberpunk africano'],
    example: 'O romance afrofuturista retrata arranha-céus solares geridos por inteligências ancestrais Kimbundu.'
  },
  'focagem': {
    word: 'focagem',
    phonetic: '[fo·ca·gem]',
    category: 'Substantivo Feminino',
    definition: 'Ação de concentrar a atenção, a mente ou a lente num objetivo específico; clareza de propósito e autodisciplina.',
    culturalNote: 'Conceito chave em livros de desenvolvimento pessoal e alta produtividade.',
    synonyms: ['foco', 'concentração', 'atenção', 'direcionamento'],
    antonyms: ['dispersão', 'distração'],
    example: 'Manter a focagem diária é o segredo para concluir os projetos em tempos conturbados.'
  },
  'soluto': {
    word: 'soluto',
    phonetic: '[so·lu·to]',
    category: 'Substantivo Masculino / Adjetivo',
    definition: '1. Substância que se dissolve num solvente para formar uma solução. 2. Livre, solto ou desatado.',
    synonyms: ['dissolvido', 'desagregado', 'livre', 'solto'],
    antonyms: ['insolúvel', 'solvente'],
    example: 'O açúcar atua como soluto ao dissolver-se na chávena de chá quente.'
  },
  'ancestral': {
    word: 'ancestral',
    phonetic: '[an·ces·tral]',
    category: 'Adjetivo / Substantivo',
    definition: 'Relativo aos antepassados, às origens antigas ou à herança cultural transmitida através das gerações.',
    culturalNote: 'A veneração e respeito pelos ancestrais é pilar fundamental da filosofia e visão do mundo africana.',
    synonyms: ['antepassado', 'secular', 'milenar', 'tradicional', 'hereditário'],
    antonyms: ['moderno', 'contemporâneo', 'recente'],
    example: 'A sabedoria ancestral continua a guiar as decisões das comunidades no Huambo.'
  },
  'cobalto': {
    word: 'cobalto',
    phonetic: '[co·bal·to]',
    category: 'Substantivo Masculino',
    definition: '1. Elemento químico metálico (Co) de tom prateado e brilho azulado, vital em baterias e tecnologia avançada. 2. Cor azul intensa.',
    synonyms: ['azul-cobalto', 'minério tecnológico', 'elemento metal'],
    example: 'O sol de cobalto refletia nos espelhos fotovoltaicos da baía tecnológica.'
  },
  'mussulo': {
    word: 'mussulo',
    phonetic: '[mus·su·lo]',
    category: 'Substantivo Próprio / Geografia',
    definition: 'Aresta litoral e restinga de areia ao sul de Luanda, famosa pelas suas praias paradisíacas, coqueiros e refúgio de tranquilidade.',
    culturalNote: 'Destino icónico de lazer e cenário de celebrações na cultura luandense.',
    synonyms: ['península do Mussulo', 'restinga de Luanda'],
    example: 'O barco cruzava as águas calmas em direção às palmeiras do Mussulo.'
  },
  'candongueiro': {
    word: 'candongueiro',
    phonetic: '[can·don·guei·ro]',
    category: 'Substantivo Masculino (Regionalismo de Angola)',
    definition: 'Carrinha azul e branca de transporte público informal e privado amplamente utilizada nas cidades de Angola.',
    culturalNote: 'Símbolo pulsante da mobilidade urbana angolana e local de trocas de histórias populares.',
    synonyms: ['táxi coletivo', 'hiace azul e branco', 'transporte popular'],
    example: 'O candongueiro apitava na rotunda da Mutamba chamando os passageiros para o Cazenga.'
  },
  'soba': {
    word: 'soba',
    phonetic: '[so·ba]',
    category: 'Substantivo Masculino',
    definition: 'Autoridade tradicional, chefe comunitário ou líder de uma tribo ou aldeia em Angola.',
    culturalNote: 'Detém papel respeitado na mediação de conflitos e preservação do direito costumeiro.',
    synonyms: ['chefe tradicional', 'líder comunitário', 'autoridade tribal'],
    example: 'O soba reuniu o conselho de anciãos sob a sombra do embondeiro.'
  },
  'kixikila': {
    word: 'kixikila',
    phonetic: '[ki·xi·ki·la]',
    category: 'Substantivo Feminino (Angolanismo)',
    definition: 'Sistema tradicional e comunitário de poupança rotativa entre amigos ou colegas de trabalho.',
    culturalNote: 'Exemplo prático da economia solidária e cooperação social angolana.',
    synonyms: ['poupança rotativa', 'consórcio informal', 'fundo comunitário'],
    example: 'Com o valor recebido da kixikila deste mês, comprou os e-books e materiais escolares.'
  }
};
