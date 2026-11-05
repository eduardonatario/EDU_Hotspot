export type LanguageCode = 'pt' | 'en';

export type ImageFormatType = 'free' | '16:9' | '9:16' | 'custom';

export type PinStyleType = 'number' | 'pin';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string; // 'pt-BR' | 'en-US'
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'pt', name: 'Português (BR)', nativeName: 'Português', flag: '🇧🇷', speechCode: 'pt-BR' },
  { code: 'en', name: 'Inglês (EN)', nativeName: 'English', flag: '🇺🇸', speechCode: 'en-US' },
];

export interface Hotspot {
  id: string;
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  text: string; // primary word
  secondaryText?: string; // optional second word in smaller gray font below
  wordLanguage?: LanguageCode; // 'pt' | 'en' - language selected for this word
  translations: Record<LanguageCode, string> & Record<string, string | undefined>;
  audioUrl?: string; // primary MP3 URL
  audioUrlsByLang?: Partial<Record<LanguageCode, string>>;
  useSystemSpeech?: boolean; // Whether the system speaks the word (Web Speech API)
  noAudio?: boolean; // Whether audio is disabled for this hotspot (text-only balloon, no play button)
  phonetic?: string;
  description?: string;
  color?: string;
  category?: string;
  icon?: string;
}

export interface HotspotProject {
  version: '1.0';
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  defaultLanguage: LanguageCode;
  audioAutoPlay: boolean; // true = auto ao abrir, false = apenas no play
  audioTriggerMode?: 'auto' | 'click'; // 'auto' ou 'click' (apenas no play)
  enableSpeechSynthesis?: boolean; // opção de ter ou não a opção de falar o texto do balão (TTS nativo)
  useSystemSpeechDefault?: boolean;
  showHoverTooltip: boolean; // default: false
  imageFormat: ImageFormatType; // '16:9' | '9:16' | 'free' | 'custom'
  pinStyle: PinStyleType; // 'number' | 'pin'
  customWidth?: number; // width in px when custom
  customHeight?: number; // height in px when custom
  balloonFontSize: number; // size in px
  showPlayButtonInBalloon: boolean;
  enablePinPulse?: boolean; // Opção para pins cintilarem
  hotspots: Hotspot[];
  createdAt: string;
  updatedAt: string;
}
