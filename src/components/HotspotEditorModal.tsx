import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Music,
  Mic,
  Square,
  Trash2,
  Check,
  Languages,
  Info,
} from 'lucide-react';
import { Hotspot, LanguageCode } from '../types/hotspot';

interface HotspotEditorModalProps {
  hotspot: Hotspot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Hotspot) => void;
  onDelete: (id: string) => void;
  activeLanguage: LanguageCode;
}

export const HotspotEditorModal: React.FC<HotspotEditorModalProps> = ({
  hotspot,
  isOpen,
  onClose,
  onSave,
  onDelete,
  activeLanguage,
}) => {
  const [formData, setFormData] = useState<Hotspot | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'style'>('text');
  const [isAudioTesting, setIsAudioTesting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (hotspot) {
      setFormData(JSON.parse(JSON.stringify(hotspot)));
      setConfirmingDelete(false);
    }
  }, [hotspot]);

  if (!isOpen || !formData) return null;

  const handleTextChange = (lang: LanguageCode, val: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      const nextTranslations = { ...prev.translations, [lang]: val };
      return {
        ...prev,
        text: lang === (prev.wordLanguage || activeLanguage) ? val : prev.text,
        translations: nextTranslations,
      };
    });
  };

  const toggleTestAudio = () => {
    if (isAudioTesting) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsAudioTesting(false);
    } else {
      const targetUrl = formData.audioUrl;
      if (!targetUrl) return;

      const audio = new Audio(targetUrl);
      audioRef.current = audio;
      setIsAudioTesting(true);

      audio.onended = () => {
        setIsAudioTesting(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsAudioTesting(false);
        audioRef.current = null;
      };

      audio.play().catch((e) => {
        console.warn(e);
        setIsAudioTesting(false);
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setFormData((prev) => (prev ? { ...prev, audioUrl: base64Data } : null));
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone error', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const colorPalette = [
    { label: 'Azul', value: '#3B82F6', bg: 'bg-blue-500' },
    { label: 'Esmeralda', value: '#10B981', bg: 'bg-emerald-500' },
    { label: 'Âmbar', value: '#F59E0B', bg: 'bg-amber-500' },
    { label: 'Rosa', value: '#EC4899', bg: 'bg-pink-500' },
    { label: 'Roxo', value: '#8B5CF6', bg: 'bg-purple-500' },
    { label: 'Ciano', value: '#06B6D4', bg: 'bg-cyan-500' },
    { label: 'Vermelho', value: '#EF4444', bg: 'bg-red-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3.5 h-3.5 rounded-full ring-4 ring-slate-100 dark:ring-slate-800"
              style={{ backgroundColor: formData.color || '#3B82F6' }}
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Configurar Hotspot
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Coordenadas: ({formData.x}%, {formData.y}%)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('text')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'text'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Palavras & Idioma</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'audio'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Áudio MP3 & Voz</span>
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'style'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Estilo & Cor</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'text' && (
            <div className="space-y-4">
              {/* Word in Portuguese */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Palavra em Português (BR) 🇧🇷
                </label>
                <input
                  type="text"
                  value={formData.translations?.pt ?? formData.text ?? ''}
                  onChange={(e) => handleTextChange('pt', e.target.value)}
                  placeholder="Ex: Livro, Cadeira, Janela..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                />
              </div>

              {/* Word in English */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Palavra em Inglês (EN) 🇺🇸
                </label>
                <input
                  type="text"
                  value={formData.translations?.en ?? ''}
                  onChange={(e) => handleTextChange('en', e.target.value)}
                  placeholder="Ex: Book, Chair, Window..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                />
              </div>

              {/* Second Word (optional - displayed below in smaller gray font) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Segunda Palavra / Subtítulo (Opcional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Aparece abaixo em cinza menor</span>
                </label>
                <input
                  type="text"
                  value={formData.secondaryText || ''}
                  onChange={(e) => setFormData({ ...formData, secondaryText: e.target.value })}
                  placeholder="Ex: substantivo, /bʊk/, tradução..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                />
              </div>

              {/* Language selection to read the word */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Idioma Padrão para Pronúncia / Leitura deste Pin:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="wordLang"
                      checked={(formData.wordLanguage || 'pt') === 'pt'}
                      onChange={() => setFormData({ ...formData, wordLanguage: 'pt' })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>🇧🇷 Português</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="wordLang"
                      checked={formData.wordLanguage === 'en'}
                      onChange={() => setFormData({ ...formData, wordLanguage: 'en' })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>🇺🇸 Inglês</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              {/* MP3 URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  URL do Arquivo MP3
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={formData.audioUrl || ''}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    placeholder="https://exemplo.com/audio/palavra.mp3"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                  />
                  {formData.audioUrl && (
                    <button
                      type="button"
                      onClick={toggleTestAudio}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      {isAudioTesting ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Testar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="modalUseSystemSpeech"
                    checked={Boolean(formData.useSystemSpeech)}
                    onChange={(e) => setFormData({ ...formData, useSystemSpeech: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <label htmlFor="modalUseSystemSpeech" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Falar com a voz do próprio sistema (TTS nativo)
                  </label>
                </div>

                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {formData.useSystemSpeech
                    ? 'O sistema falará o texto usando a voz nativa do navegador.'
                    : 'Quando o balão deste hotspot for aberto, este arquivo MP3 será tocado automaticamente.'}
                </p>
              </div>

              {/* Voice recording option */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Gravar Minha Própria Pronúncia
                    </span>
                  </div>

                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Mic className="w-3 h-3" />
                      <span>Iniciar Gravação</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 animate-pulse transition-colors"
                    >
                      <Square className="w-3 h-3" />
                      <span>Parar Gravação</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isRecording
                    ? '🔴 Gravando áudio pelo microfone... Fale a palavra claramente e clique em Parar.'
                    : 'Grave sua pronúncia diretamente do navegador para salvar como áudio deste hotspot.'}
                </p>
              </div>

              {/* Native speech fallback notice */}
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                <span>
                  Se a URL do MP3 não for informada, o aplicativo usa automaticamente a síntese de voz nativa no idioma selecionado.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-4">
              {/* Hotspot Color */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Cor do Marcador
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {colorPalette.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: col.value })}
                      className={`w-8 h-8 rounded-full ${col.bg} flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${
                        formData.color === col.value ? 'ring-4 ring-indigo-500/30 scale-110' : ''
                      }`}
                    >
                      {formData.color === col.value && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coordinates */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Posição na Imagem (%)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Eixo X (Horizontal: {formData.x}%)</label>
                    <input
                      type="range"
                      min="2"
                      max="98"
                      value={formData.x}
                      onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Eixo Y (Vertical: {formData.y}%)</label>
                    <input
                      type="range"
                      min="2"
                      max="98"
                      value={formData.y}
                      onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Clean Adjusted Delete Confirmation */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div>
            {confirmingDelete ? (
              <div className="flex items-center gap-2 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(formData.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Exclusão</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Hotspot</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(formData);
                onClose();
              }}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-500/20 transition-all"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
