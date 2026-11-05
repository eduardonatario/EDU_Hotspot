import { Hotspot, LanguageCode, SUPPORTED_LANGUAGES } from '../types/hotspot';

class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.9;
  private listeners: Set<(state: { isPlaying: boolean; currentId: string | null; progress: number }) => void> = new Set();
  private progressInterval: any = null;

  constructor() {
    // Warm up speech synthesis if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // loaded
      };
    }
  }

  public subscribe(listener: (state: { isPlaying: boolean; currentId: string | null; progress: number }) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(isPlaying: boolean, currentId: string | null, progress: number = 0) {
    this.listeners.forEach((listener) => listener({ isPlaying, currentId, progress }));
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  public getVolume() {
    return this.volume;
  }

  public stop() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.notify(false, null, 0);
  }

  public async playHotspotAudio(
    hotspot: Hotspot,
    lang: LanguageCode,
    allowSpeechSynthesis: boolean = true
  ): Promise<boolean> {
    this.stop();

    const wordToSpeak = hotspot.translations[lang] || hotspot.text;
    const effectiveSpeechLang = hotspot.wordLanguage || lang;

    // If user specified system speech preference for this hotspot, speak directly if speech is allowed
    if (hotspot.useSystemSpeech) {
      if (!allowSpeechSynthesis) return false;
      return this.speakText(wordToSpeak, effectiveSpeechLang, hotspot.id);
    }

    const customLangAudio = hotspot.audioUrlsByLang?.[lang];
    const targetAudioUrl = customLangAudio || hotspot.audioUrl;

    if (targetAudioUrl && targetAudioUrl.trim() !== '') {
      try {
        const audio = new Audio(targetAudioUrl);
        this.currentAudio = audio;
        audio.volume = this.volume;

        this.notify(true, hotspot.id, 0);

        audio.addEventListener('timeupdate', () => {
          if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            this.notify(true, hotspot.id, progress);
          }
        });

        audio.addEventListener('ended', () => {
          this.notify(false, null, 100);
          this.currentAudio = null;
        });

        audio.addEventListener('error', (e) => {
          console.warn('Audio URL playback error:', e);
          this.currentAudio = null;
          if (allowSpeechSynthesis) {
            this.speakText(wordToSpeak, effectiveSpeechLang, hotspot.id);
          }
        });

        await audio.play();
        return true;
      } catch (err) {
        console.warn('Could not play custom audio:', err);
        if (allowSpeechSynthesis) {
          return this.speakText(wordToSpeak, effectiveSpeechLang, hotspot.id);
        }
        return false;
      }
    } else {
      if (allowSpeechSynthesis) {
        return this.speakText(wordToSpeak, effectiveSpeechLang, hotspot.id);
      }
      return false;
    }
  }

  public speakText(text: string, lang: LanguageCode, hotspotId: string | null = null): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      this.stop();

      const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
      const speechCode = langMeta?.speechCode || 'pt-BR';

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechCode;
      utterance.volume = this.volume;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.startsWith(lang) || v.lang.replace('_', '-') === speechCode);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      this.currentUtterance = utterance;
      this.notify(true, hotspotId, 50);

      utterance.onend = () => {
        this.notify(false, null, 100);
        this.currentUtterance = null;
      };

      utterance.onerror = () => {
        this.notify(false, null, 0);
        this.currentUtterance = null;
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.error('SpeechSynthesis error:', e);
      return false;
    }
  }
}

export const audioManager = new AudioManager();
