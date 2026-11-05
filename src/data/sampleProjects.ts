import { HotspotProject } from '../types/hotspot';

export interface SampleAudioPreset {
  label: string;
  url: string;
  category: string;
}

export const SAMPLE_AUDIO_PRESETS: SampleAudioPreset[] = [
  {
    label: 'Pronúncia: Book (Livro)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7b/En-us-book.ogg/En-us-book.ogg.mp3',
    category: 'Inglês',
  },
  {
    label: 'Pronúncia: Coffee (Café)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/36/En-us-coffee.ogg/En-us-coffee.ogg.mp3',
    category: 'Inglês',
  },
  {
    label: 'Pronúncia: Computer (Computador)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/25/En-us-computer.ogg/En-us-computer.ogg.mp3',
    category: 'Inglês',
  },
  {
    label: 'Pronúncia: Chair (Cadeira)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/5/52/En-us-chair.ogg/En-us-chair.ogg.mp3',
    category: 'Inglês',
  },
  {
    label: 'Pronúncia: Clock (Relógio)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/be/En-us-clock.ogg/En-us-clock.ogg.mp3',
    category: 'Inglês',
  },
];

// Single sample project as requested: only "Sala de Aula & Estudo"
export const SAMPLE_PROJECTS: HotspotProject[] = [
  {
    version: '1.0',
    id: 'classroom-vocab',
    title: 'Sala de Aula & Estudo',
    description: 'Exemplo interativo com vocabulário escolar e pronúncias.',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
    defaultLanguage: 'pt',
    audioAutoPlay: true,
    showHoverTooltip: false, // Default is NOT to display name on hover
    imageFormat: 'free',
    pinStyle: 'pin',
    balloonFontSize: 15, // Reduced text size inside the balloon
    showPlayButtonInBalloon: false, // Option to show play button in balloon
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hotspots: [
      {
        id: 'hs-blackboard',
        x: 48,
        y: 28,
        text: 'Quadro Negro',
        translations: {
          pt: 'Quadro Negro',
          en: 'Blackboard',
        },
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/be/En-us-clock.ogg/En-us-clock.ogg.mp3',
        phonetic: '/ˈblæk.bɔːrd/',
        description: 'Superfície onde o professor escreve com giz.',
        color: '#3B82F6',
        category: 'Mobiliário',
        useSystemSpeech: false,
      },
      {
        id: 'hs-chair',
        x: 24,
        y: 72,
        text: 'Cadeira',
        translations: {
          pt: 'Cadeira',
          en: 'Chair',
        },
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/5/52/En-us-chair.ogg/En-us-chair.ogg.mp3',
        phonetic: '/tʃeər/',
        description: 'Assento escolar.',
        color: '#10B981',
        category: 'Mobiliário',
        useSystemSpeech: false,
      },
      {
        id: 'hs-desk',
        x: 45,
        y: 80,
        text: 'Carteira Escolar',
        translations: {
          pt: 'Carteira Escolar',
          en: 'Student Desk',
        },
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7b/En-us-book.ogg/En-us-book.ogg.mp3',
        phonetic: '/desk/',
        description: 'Mesa do estudante.',
        color: '#F59E0B',
        category: 'Mobiliário',
        useSystemSpeech: false,
      },
      {
        id: 'hs-books',
        x: 82,
        y: 62,
        text: 'Livros',
        translations: {
          pt: 'Livros',
          en: 'Books',
        },
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7b/En-us-book.ogg/En-us-book.ogg.mp3',
        phonetic: '/bʊks/',
        description: 'Materiais de leitura.',
        color: '#EC4899',
        category: 'Material',
        useSystemSpeech: false,
      },
      {
        id: 'hs-window',
        x: 88,
        y: 26,
        text: 'Janela',
        translations: {
          pt: 'Janela',
          en: 'Window',
        },
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/9/98/En-us-window.ogg/En-us-window.ogg.mp3',
        phonetic: '/ˈwɪn.dəʊ/',
        description: 'Janela da sala.',
        color: '#06B6D4',
        category: 'Estrutura',
        useSystemSpeech: false,
      },
    ],
  },
];
